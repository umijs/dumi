---
nav: 指南
group: 基础
order: 0
---

# 初始化

## 环境准备

首先得有 [node](https://nodejs.org/en/)，并确保 node 版本是 14 或以上。（推荐用 [nvm](https://github.com/nvm-sh/nvm) 来管理 node 版本，windows 下推荐用 [nvm-windows](https://github.com/coreybutler/nvm-windows)）

```bash
$ node -v
v14.19.1
```

## 脚手架

```bash
# 先找个地方建个空目录。
$ mkdir myapp && cd myapp

# 通过官方工具创建项目
$ npx create-dumi@beta

# 安装依赖
$ yarn

# 启动 dumi
$ yarn start
```
