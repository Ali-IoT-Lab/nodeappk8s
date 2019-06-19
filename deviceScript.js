var aliyunIot = require('aliyun-iot-device-sdk');
var fs = require('fs');
var path = require('path');
try {
var params = JSON.parse(process.argv[2]);
} catch (error) {
    console.log('wrong params');
}
//console.log('555555 child');
//console.log(params);
var timeoutCode=0;
var productKey = params.productKey;
var deviceName = params.deviceName;
var task_name = process.argv[3];
var historyRecord = {
    task_name: task_name
};
let upStart = (device, interval) => {
    timeoutCode = setTimeout(() => {
        var now = new Date().getTime();  //这里now直接发报错转string后发
        var sedMsg = {
            time: now,
            deviceName: deviceName
        };
        device.publish(`/broadcast/${productKey}/up`, JSON.stringify(sedMsg));
        //console.log('循环publish消息 ' + now);
        upStart(device, interval);
    }, interval);
    //console.log('up start !!!!!!');
}; 

let upStop = (device) => {
    if (timeoutCode) {
        //console.log('关闭定时器！！！！！');
        clearTimeout(timeoutCode);
        device.end();
    }
    //console.log('up stop !!!!!!!');
}

let downStart = (device) => {
    device.subscribe(`/broadcast/${productKey}/down`);
    //console.log('down start !!!!!!');
}

let downStop= (device) => {
    //console.log('down stop !!!!!!!');
    //存储相关信息
    //把缓存的历史信息存入文件
    fs.writeFileSync(path.resolve(__dirname, `./resource/devices/${deviceName}`), JSON.stringify(historyRecord));
    //console.log('7777777');   
}

aliyunIot.register(params,(res)=>{
    //console.log('6666666');
    //console.log(res);
    if(res.code == '200'){
        // 注册成功请保存设备三元组，只会返回一次
        res.data.regionId = 'cn-shanghai';
        var device = aliyunIot.device(res.data);
        //console.log('7777777');
        
        //建立连接
        device.on('connect', () => {
            //console.log('device connect successfully!' + deviceName);
        });

        device.subscribe(`/broadcast/${productKey}/msg`);
        device.on('message', (topic, payload) => {
            //console.log('88888888');
            //console.log(topic);
            //console.log(payload.toString());
            //console.log('9999');
            if (topic === `/broadcast/${productKey}/msg`) {
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
                if (msg.action == 'start') {
                    if (msg.type === 'up') {
                        upStart(device, Number(msg.interval));
                    } else if (msg.type === "down") {
                        downStart(device);
                    } else {
                        console.log("unknow msg type");
                    }
                } else if (msg.action === 'stop') {
                    if (msg.type === 'up') {
                        upStop(device);
                    } else if (msg.type === "down") {
                        downStop(device);
                    } else {
                        console.log("unknow msg type");
                    }
                } else {
                    console.log("unknow msg action");
                }
            } else if (topic == `/broadcast/${productKey}/down`) {
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
    }
});

