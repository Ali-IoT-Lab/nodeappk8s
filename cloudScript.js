var aliyunIot = require('aliyun-iot-device-sdk');
var fs = require('fs');
var path = require('path');
var child_process = require('child_process');

try {
    var params = JSON.parse(process.argv[2]);
} catch (error) {
    console.log('wrong params');
}
//console.log('555555 cloud child');
//console.log(params);

var timeoutCode=0;
var productKey = params.productKey;
var deviceName = params.deviceName;
var task_name = process.argv[3];
var historyRecord = {
    task_name: task_name
};
var usage = {
    task_name: task_name,
    cpuUsage: [],
    memUsage: []
};
let downStart = (device, interval) => {
    timeoutCode = setTimeout(() => {
        var now = new Date().getTime();  //这里now直接发报错转string后发
        var sedMsg = {
            time: now,
            deviceName: deviceName
        };
        //连续执行50次，才能覆盖当前task下约5万个设备
        for (var i = 0; i < 50; i++){
            device.publish(`/broadcast/${productKey}/down`, JSON.stringify(sedMsg));
        }
        //console.log('cloud 循环publish消息 ' + now);
        downStart(device, interval);
    }, interval);
}; 

let downStop = () => {
    if (timeoutCode) {
        //console.log('333333 down stop !!!!!');
        //console.log('cloud  结束循环');
        clearTimeout(timeoutCode);
    }
    //把内存和cpu使用率缓存，写入文档
    fs.writeFileSync(path.resolve(__dirname, `./resource/usage/downUsage`), JSON.stringify(usage));
    var analyse_down_process = child_process.fork(path.resolve('./analyseScript.js'), ["down"]);
}

let upStart = (device) => {
    //console.log('444444 cloud  up start !!!!');
    device.subscribe(`/broadcast/${productKey}/up`);
}

let upStop= (device) => {
    //console.log('5555555 cloud up stop !!!!!!');
    //console.log(historyRecord);
    //console.log(JSON.stringify(historyRecord));
    //console.log('6666666');
    //把缓存的历史信息存入文件
    fs.writeFileSync(path.resolve(__dirname, `./resource/cloud/history`), JSON.stringify(historyRecord));
    //console.log('7777777');
    //把内存和cpu使用率缓存，写入文档
    fs.writeFileSync(path.resolve(__dirname, `./resource/usage/upUsage`), JSON.stringify(usage));
    var analyse_up_process = child_process.fork(path.resolve('./analyseScript.js'), ["up"]);
    device.end();
}

var command = `sh ${path.resolve(path.join(__dirname, "./utils/usage.sh"))}`;
var collectUsage = (cmd) => {
    setTimeout(() => {
        child_process.exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.log(error);
            } else {
                var tmpArr = stdout.split('\n');
                var tmpUsage =  JSON.parse(tmpArr[0]);
                //console.log('mnmmmmmm');
                //数据格式{ cpuUsage: '93.3', memUsage: '0.20' }
                //console.log(usage);
                //console.log('---------');
                var tmpCpu = (100 - Number(tmpUsage.cpuUsage)).toFixed(1);
                usage.cpuUsage.push(tmpCpu);
                usage.memUsage.push(Number(tmpUsage.memUsage));
            }
        });  
        collectUsage(cmd);
    }, 60 * 1000);
}

collectUsage(command);


var device = aliyunIot.device(params);
//console.log('7777777');

//建立连接
device.on('connect', () => {
    //console.log('cloud !!!  connect successfully!');
});

//console.log('xxxxx')
//console.log(productKey)
device.subscribe(`/broadcast/${productKey}/msg`);
device.on('message', (topic, payload) => {
   //console.log('cloud 111111 xxxxxxxx');
   //console.log('cloud :  ' + topic );
   //console.log(payload.toString());

    if (topic == `/broadcast/${productKey}/msg`) {
        //console.log('2222222xxxxxxx');
        try {
            var msg = JSON.parse(payload.toString());
        } catch (err) {
            console.log("unknow msg");
            return;
        }
        /**
         * msg = {
         *  type: enum  // up  or  down
         *  interval: number   //时间间隔，毫秒数
         *  action: enum //start or stop 
         * }
         */
        //按消息分类操作
        if (msg.action === 'start') {
            if (msg.type === 'up') {
                upStart(device);
            } else if (msg.type === "down") {
                downStart(device,  Number(msg.interval));
            } else {
                console.log("unknow msg type");
            }
        } else if (msg.action === 'stop') {
            if (msg.type === 'up') {
                upStop(device);
            } else if (msg.type === "down") {
                downStop();
            } else {
                console.log("unknow msg type");
            }
        } else {
            console.log("unknow msg action");
        }
    } else if (topic == `/broadcast/${productKey}/up`) {
        //console.log('33333333xxxxxxx')
        var timeRecv = new Date().getTime();
        try {
            var recvMsg = JSON.parse(payload.toString());
            var timeSend = Number(recvMsg.time); 
            var timeDiff= timeRecv-timeSend;
            //存文件  device_name, time_diff, task_name
            if (undefined == historyRecord[recvMsg.deviceName]) {
                historyRecord[recvMsg.deviceName] = [];
                historyRecord[recvMsg.deviceName].push(timeDiff);
            } else {
                historyRecord[recvMsg.deviceName].push(timeDiff);
            }
            //console.log('aaaaaa');
            //console.log(recvMsg);
            //console.log(historyRecord);
            //console.log('bbbbbbb');
        } catch (error) {
            console.log('wrong up msg');
        }
    } 
});