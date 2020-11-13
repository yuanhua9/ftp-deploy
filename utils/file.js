var path = require('path');
var fs = require('fs');

var filePath = process.argv[2];
var lookingForString = process.argv[3];

recursiveReadFile(filePath);

function recursiveReadFile(fileName) {
  if (!fs.existsSync(fileName)) return;
  if (isFile(fileName)) {
    check(fileName);
  }

  if (isDirectory(fileName)) {
    var files = fs.readdirSync(fileName);
    files.forEach(function(val, key) {
      var temp = path.join(fileName, val);
      if (isDirectory(temp)) recursiveReadFile(temp);
      if (isFile(temp)) check(temp);
    });
  }
}

function check(fileName) {
  var data = readFile(fileName);
  var exc = new RegExp(lookingForString);
  if (exc.test(data)) console.log(fileName);
}

function isDirectory(fileName) {
  if (fs.existsSync(fileName)) return fs.statSync(fileName).isDirectory();
}

function isFile(fileName) {
  if (fs.existsSync(fileName)) {
    return fs.statSync(fileName).isFile();
  }
  return false;
}

function isExistText(fileName, str) {
  let content = readFileSync(fileName);
  if (content.indexOf(str) > -1) {
    return true;
  }
  return false;
}

function readFileSync(fileName) {
  if (fs.existsSync(fileName)) {
    return fs.readFileSync(fileName, 'utf-8');
  }
  return '';
}

function writeFileSync(path, content) {
  fs.writeFileSync(path, content, function(err) {
    if (err) {
      throw err;
    }
    console.log('Hello.');
  });
}

module.exports = {
  isFile,
  isExistText,
  readFileSync,
  writeFileSync,
};
