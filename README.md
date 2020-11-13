# @yuanhua/ftp-deploy

## 即插即用的 ftp 服务

- `用于部署静态资源到 ftp 服务器`
- `自动新增配置文件 .yhftpconfig`
- `自动新增全局忽略文件，防止勿提交到代码库`
- `暂时只支持Mac系统`

1、安装

```bash
$ npm i @yuanhua/ftp-deploy -g
```

2、使用

在`package.json`同层级执行命令行。

```
$ ftp-deploy
```

修改配置文件`.yhftpconfig` , 示例如下：

```
username = username
password = password
host = host
port = port
from = dist
to = /data/htdocs/demo/
```

3、部署项目
```
$ ftp-deploy
```

**特别提醒：** 

`.yhftpconfig`文件内容为敏感信息，注意保密，切勿上传代码库。
