const fs = require('fs');
const { exec } = require('child_process');
const rimraf = require('rimraf');

function executeShell(commandLine, verbose = false) {
  return new Promise((resolve, reject) => {
    exec(commandLine, (err, stdout) => {
      if (err) {
        reject(err);
      }
      verbose && console.log(`${stdout}`);
      resolve();
    });
  });
}

function removeDir(targetDir) {
  if (fs.existsSync(targetDir)) {
    rimraf.sync(targetDir);
  }
}

module.exports = {
  executeShell,
  removeDir,
};
