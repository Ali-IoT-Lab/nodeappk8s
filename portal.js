
var aliyunIot = require('aliyun-iot-device-sdk');

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
        deviceSecret: "CvBHzBXeQHUflHDHciyYkJM6lPYcJvdy" 
    }
}]

var params = {
    productKey: "a15j9SUHhXX",
    deviceName: "portal",
    deviceSecret: "cmoOTSSnSzfPIBlDM4nl6yw6SzkiOW3x",
    regionId: "cn-shanghai"
};
var productKey = params.productKey;
//var deviceName = params.deviceName;

var device = aliyunIot.device(params);
console.log('7777777');

 /**
                 * msg = {
                 *  type: enum  // up  or  down
                 *  interval: number   //时间间隔，毫秒数
                 *  action: enum //start or stop 
                 * }
                 */
var upStartMsg = JSON.stringify({
    type: 'up',
    action: 'start',
    interval: 30 * 1000
});
var upStopMsg = JSON.stringify({
    type: 'up',
    action: 'stop',
    interval: 60 * 1000
});
var downStartMsg = JSON.stringify({
    type: 'down',
    action: 'start',
    interval: 30 * 1000
});
var downStopMsg = JSON.stringify({
    type: 'down',
    action: 'stop',
    interval: 60 * 1000
});
//建立连接
device.on('connect', () => {
    console.log('connect successfully!');
    // device.subscribe(`/broadcast/${productKey}/msg`);
    
    //device.publish(`/broadcast/${productKey}/msg`, downStartMsg);
    //device.publish(`/broadcast/${productKey}/msg`, downStopMsg);
    //device.publish(`/broadcast/${productKey}/msg`, upStartMsg);
    //device.publish(`/broadcast/${productKey}/msg`, upStopMsg);
    //连续执行50次，才能覆盖当前task下约5万个设备
    for (var i = 0; i < 50; i++){
        //device.publish(`/broadcast/${productKey}/msg`, downStartMsg);
        //device.publish(`/broadcast/${productKey}/msg`, downStopMsg);
        //device.publish(`/broadcast/${productKey}/msg`, upStartMsg);
        //device.publish(`/broadcast/${productKey}/msg`, upStopMsg);
    }
    device.end();
});




