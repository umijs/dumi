---
nav: 指南
group:
  title: 基础
  order: 0
order: 0
---

# 初始化

## 环境准备

确保正确安装 [Node.js](https://nodejs.org/en/) 且版本为 14+ 即可。

```bash
$ node -v
v14.19.1
```

## 脚手架

```bash
# 先找个地方建个空目录。
$ mkdir myapp && cd myapp

# 通过官方工具创建项目，选择你需要的模板
$ npx create-dumi

# 选择一个模板
$ ? Pick template type › - Use arrow-keys. Return to submit.
$ ❯   Static Site # 用于构建网站
$     React Library # 用于构建组件库，有组件例子
$     Theme Package # 主题包开发脚手架，用于开发主题包

# 安装依赖后启动项目
$ npm start
```
