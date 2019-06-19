var csvOperation = require('./utils/csv');

//内网IP集合
var servers = [{
    ip: '192.168.31.42',
    productKey: 'a15j9SUHhXX',
    productSecret: 'pQvahPGGTmipXUwn'
}, /*{
    id: 2,
    ip: '192.168.101.101' 
} */]

//初始化生成，设备名.csv文件用于导入到设备中去
var deviceGroupCount = 2;   //每台服务器上设备数量等于count * 1000 - count   默认50   //写1000条导入不到页面上去，所以此处单个文件999 
//只在初始化时调用一次
csvOperation.generateCsv(servers, deviceGroupCount, (res) => {
    console.log(res);
});

//根据服务器ip、服务器设备组数量 获取该服务器下的所有deviceName集合
// csvOperation.readCsv('192.168.31.31', deviceGroupCount, (res) => {
    
// });


