var child_process = require('child_process');
var path = require('path');
//获取当前设备的内网ip
var cmd = `/sbin/ifconfig -a|grep inet|grep -v 127.0.0.1|grep -v inet6|awk '{print $2}'|tr -d "addr:"`;
//内网IP集合
var servers = [{
    ip: '192.168.31.42',
    productKey: 'a15j9SUHhXX',
    productSecret: 'pQvahPGGTmipXUwn',
    portal: {
        deviceName: "portal",
        deviceSecret: "cmoOTSSnSzfPIBlDM4nl6yw6SzkiOW3x"
      },
    cloud: {
        deviceName: "cloud",
        deviceSecret: "wz4BOPMJVKZDpOwAekm1rW6TQ0fWToXv" 
    }
}];

let getKeyAndSecretByIp = (ip) => {
    var keyObj = {
        device: { 
            productKey: '',
            productSecret: ''
        },
        cloud: {
            productkey: '',
            deviceName: '',
            deviceSecret: ''
        }
    }
    for (var i=0; i<servers.length; i++) {
        if (servers[i].ip === ip) {
            keyObj.device.productKey = servers[i].productKey;
            keyObj.device.productSecret = servers[i].productSecret;
            keyObj.cloud.productKey = servers[i].productKey;
            keyObj.cloud.deviceName = servers[i].cloud.deviceName;
            keyObj.cloud.deviceSecret = servers[i].cloud.deviceSecret;
            break;
        } 
    }
    return keyObj;
}

child_process.exec(cmd, (err, stdout, stderr) => {
    if (err) {
        console.log(err);
    } else {
        //console.log('1111');
        //console.log(stdout);
        ip = stdout.split("\n")[0];
        var keyObj = getKeyAndSecretByIp(ip);
        //console.log('2222');
        //console.log(keyObj);
        count = 2;  //默认1000
        deviceGroupCount = 2; //默认50
        //根据当前设备ip生成，当前服务器上对应的设备deviceNameList
        var deviceNameList=[];
        for (var i = 1; i <= deviceGroupCount; i++) {
            for (var j = 1; j < count; j++) {
                deviceNameList.push(`${ip}:${i}:${j}`);
            }
        }
        //console.log('33333');
        //console.log(deviceNameList);
        //创建cloud子进程模拟云端
        var cloud_process = child_process.fork(path.resolve('./cloudScript.js'), [JSON.stringify(keyObj.cloud), ip]);
        cloud_process.on('close', (code) => {
            console.log('云端模拟进程退出： ' + code);
        });
        //遍历设备，fork子进程
        childProcessNum = deviceNameList.length;
        if (childProcessNum) {
            for (var i = 0; i < childProcessNum; i++) {
                keyObj.device.deviceName = deviceNameList[i];
                //console.log('4444');
                //console.log(keyObj);
                var device_process = child_process.fork(path.resolve('./deviceScript.js'), [JSON.stringify(keyObj.device), ip]);
                device_process.on('close', (code) => {
                    //console.log('子进程退出：' + code);
                });
            }
        }
    }
});



