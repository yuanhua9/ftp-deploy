#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const ora = require('ora');
const { executeShell, removeDir } = require('../utils/shell');
const chalk = require('chalk');
const ini = require('ini');
const client = require('scp2');
const inquirer = require('inquirer');
const os = require('os');
const { argv } = require('yargs').alias({ f: 'from', t: 'to' });

const { isExistText, readFileSync, isFile, writeFileSync } = require('../utils/file');

const HOME_DIR = os.homedir();
const GIT_IGNORE_FILE_NAME = '.gitignore_global';
const GIT_IGNORE_DIR = `${HOME_DIR}/${GIT_IGNORE_FILE_NAME}`;
const GIT_CONFIG_DIR = `${HOME_DIR}/.gitconfig`;

const program = require('commander');
const cwd = process.cwd();
const CONFIG_NAME = '.yhftpconfig';
const CONFIG_PATH = path.join(cwd, CONFIG_NAME);
const scp = util.promisify(client.scp);

const defaultConf = { username: '', password: '', host: '', port: '', from: '', to: '' };

const defaultConfStr = (function() {
  let str = '';
  Object.keys(defaultConf).map(res => {
    str += `${res} =${defaultConf[res]} \n`;
  });
  return str;
})();
let config;

checkGitignore();
inityhftpconfig();

function inityhftpconfig() {
  if (!isFile(CONFIG_PATH)) {
    writeFileSync(CONFIG_PATH, defaultConfStr);
  }
  config = getConfig();
  checkConfig();
}

function getConfig() {
  try {
    return Object.assign(defaultConf, ini.parse(readFileSync(CONFIG_PATH)));
  } catch (err) {
    return null;
  }
}

function checkConfig() {
  let isFirst = true;
  Object.keys(config).forEach(key => {
    if (!config[key]) {
      isFirst
        ? (console.error(
            `${chalk.yellow('Missing configuration file: ')}${chalk.red(`"${CONFIG_NAME}"`)}`
          ),
          (isFirst = !isFirst))
        : '';
      console.error(`   ${chalk.red(key)} is Empty`);
    }
  });
  isFirst ? run(config) : process.exit(1);
}

function run() {
  let { from, to } = config;
  config.from = path.resolve(from);
  config.to = `/${to.replace(/^(\s|\/)+|(\s|\/)+$/g, '')}/`;
  inquirer
    .prompt([
      {
        type: 'confirm',
        message: `Are you sure you want to deploy ${chalk.yellow(
          `"${config.from}"`
        )} to ${chalk.yellow(`"${config.to}"`)}?`,
        name: 'ok',
        default: true,
      },
    ])
    .then(answers => {
      if (answers.ok) {
        deploy();
      } else {
        process.exit(1);
      }
    })
    .catch(err => {
      process.exit(1);
    });
}

async function deploy() {
  const { username, password, host, port } = config;
  let { from, to } = config;
  let time = Date.now();
  const spinner = ora();
  spinner.start('Uploading files...');
  try {
    await scp(from, {
      host,
      port,
      username,
      password,
      path: to,
    });
    time = ((Date.now() - time) / 1000).toFixed(2);
    spinner.succeed(`All files uploaded successfully in ${chalk.yellow(time)}s!`);
  } catch (err) {
    spinner.fail(`Deploy failed! Error: ${chalk.red(err.message)}.`);
  }
}

function checkGitignore() {
  if (isFile(GIT_CONFIG_DIR) && isExistText(GIT_IGNORE_DIR, CONFIG_NAME)) return;
  executeShell(`git config --global core.excludesfile ${GIT_IGNORE_DIR}`, (verbose = false))
    .then(res => {
      if (isExistText(GIT_IGNORE_DIR, CONFIG_NAME)) return;

      let content = readFileSync(GIT_IGNORE_DIR);
      content = `${content}\n${CONFIG_NAME}`;
      fs.writeFile(GIT_IGNORE_DIR, content, function(err) {
        if (err) {
          throw err;
        }
        console.log(chalk.green(`\n 配置文件 ${CONFIG_NAME} 已全局忽略`));
      });
    })
    .catch(err => {
      console.log(
        `${chalk.red('Git库警告：')} \n ${chalk.yellow(
          `配置文件${CONFIG_NAME} 全局忽略失败，解决方案如下：`
        )}  \n ${chalk.yellow(`a、请重新执行命令行；\n b、在.gitignore中自行忽略；`)}  \n `
      );
    });
}
