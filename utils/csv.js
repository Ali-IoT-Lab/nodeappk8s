var fs = require('fs');
var path = require('path');


let readCsv = (serverIp, count, callback) => {
  var deviceNameList = [];
  for (var i=1; i<=count; i++) {
    var data = fs.readFileSync(path.resolve(__dirname, `../resource/${serverIp}/${i}.csv`), 'utf-8');
    var arr = data.toString().split("\n");
    deviceNameList =  deviceNameList.concat(arr);
  }
  callback(deviceNameList);
}


let generateCsv = (servers, count, callback) => {
  servers.forEach(item => {
    fs.mkdirSync(path.resolve(__dirname, `../resource/${item.ip}`));
    for (var j=1; j<=count; j++) {
      var dataStr = "";
      for (var i=1; i<2; i++) {
        if (i < 999) {
          dataStr += `${item.ip}:${j}:${i}\n`;
        } else {
          dataStr += `${item.ip}:${j}:${i}`;
        }
      }
      fs.writeFile(path.resolve(__dirname, `../resource/${item.ip}/${j}.csv`), dataStr, 'utf-8', function (err) {
        if (err) {
          return callback(err);
        } else{
          return callback('It\'s saved!');
        }
      });
    }
  });
}


module.exports = {
  generateCsv: generateCsv,
  readCsv: readCsv
}