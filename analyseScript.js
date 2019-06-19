var fs = require('fs');
var path = require('path');

// var usage = {
//     task_name: task_name,
//     cpuUsage: [],
//     memUsage: []
// };
var usageAnalyse = (valueType, actionType, usageObj) => {
    if (valueType == 'cpu') {
        if (actionType == 'max') {
            var maxCpuNum=0;
            if (usageObj.cpuUsage.length) {
                usageObj.cpuUsage.forEach(item => {
                    if (item > maxCpuNum) {
                        maxCpuNum = item;
                    }
                });
            }
            return maxCpuNum;
        } else {
            var avgCpuNum=0;
            if (usageObj.cpuUsage.length) {
                var sum = 0;
                usageObj.cpuUsage.forEach(item => {
                    sum += item;
                });
                avgCpuNum = sum/(usageObj.cpuUsage.length);
            }
            return avgCpuNum;
        }
    } else {
        if (actionType == 'max') {
            var maxMemNum=0;
            if (usageObj.memUsage.length) {
                usageObj.memUsage.forEach(item => {
                    if (item > maxMemNum) {
                        maxMemNum = item;
                    }
                });
            }
            return maxMemNum;
        } else {
            var avgMemNum=0;
            if (usageObj.memUsage.length) {
                var sum = 0;
                usageObj.memUsage.forEach(item => {
                    sum += item;
                });
                avgMemNum = sum/(usageObj.memUsage.length);
            }
            return avgMemNum;
        }
    }
}

let getTimeDiff = () => {
    var timeDiff = {};
    var fileNameList = fs.readdirSync(path.resolve("./resource/devices"));
    fileNameList.forEach(item => {
        deviceInfo = fs.readFileSync(path.resolve(`./resource/devices/${item}`));
        try {
            deviceInfoObj = JSON.parse(deviceInfo.toString());
            timeDiff[item] = deviceInfoObj.cloud;
        } catch (error) {
            console.log("wrong devices txt ");
        }
    });
    return timeDiff;
}

if (process.argv[2] == 'up') {
    var usageStr = fs.readFileSync(path.resolve('./resource/usage/upUsage')).toString();
    var timeDiffStr = fs.readFileSync(path.resolve('./resource/cloud/history')).toString();
    try {
        var usage = JSON.parse(usageStr);
        var timeDiff = JSON.parse(timeDiffStr);
        var task_name = usage.task_name;
        var maxCpuUsage = usageAnalyse('cpu', 'max', usage);
        var maxMemUsage = usageAnalyse('mem', 'max', usage);
        var avgCpuUsage = usageAnalyse('cpu', 'avg', usage);
        var avgMemUsage = usageAnalyse('mem', 'avg', usage);
        delete timeDiff.task_name;
        console.log("数据上传分析报告: ");
        console.log("cpu使用率最大值为: " + maxCpuUsage);
        console.log("mem使用率最大值为: " + maxMemUsage);
        console.log("cpu使用率均值为: " + avgCpuUsage);
        console.log("mem使用率均值为: " + avgMemUsage);
        console.log("数据上传的时间统计: ");
        console.log("格式: {虚拟设备名1: [时间1,时间2,...], 虚拟设备名2: [], ...}" );
        console.log(JSON.stringify(timeDiff));
    } catch (error) {
        console.log(error);
        console.log('wrong text type');
    }
} else {
    var usageStr = fs.readFileSync(path.resolve('./resource/usage/downUsage')).toString();
    try {
        var usage = JSON.parse(usageStr);
        var timeDiff = getTimeDiff();
        var task_name = usage.task_name;
        var maxCpuUsage = usageAnalyse('cpu', 'max', usage);
        var maxMemUsage = usageAnalyse('mem', 'max', usage);
        var avgCpuUsage = usageAnalyse('cpu', 'avg', usage);
        var avgMemUsage = usageAnalyse('mem', 'avg', usage);
        console.log("数据下发分析报告: ");
        console.log("当前服务task为: " + task_name);
        console.log("cpu使用率最大值为: " + maxCpuUsage);
        console.log("mem使用率最大值为: " + maxMemUsage);
        console.log("cpu使用率均值为: " + avgCpuUsage);
        console.log("mem使用率均值为: " + avgMemUsage);
        console.log("数据下发的时间统计: ");
        console.log("格式: {虚拟设备名1: [时间1,时间2,...], 虚拟设备名2: [], ...}" );
        console.log(JSON.stringify(timeDiff));
    } catch (error) {
        console.log(error);
        console.log('wrong text type');
    }
}