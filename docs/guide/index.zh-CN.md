---
title: 介绍
order: 1
toc: menu
nav:
  title: 指南
  order: 1
---

## 什么是 dumi？

dumi，中文发音**嘟米**，是一款为组件开发场景而生的文档工具，与 [father](https://github.com/umijs/father) 一起为开发者提供一站式的组件开发体验，**father 负责构建，而 dumi 负责组件开发及组件文档生成**。

## 特性

- 📦 开箱即用，将注意力集中在组件开发和文档编写上
- 📋 丰富的 Markdown 扩展，不止于渲染组件 demo
- 🏷 基于 TypeScript 类型定义，自动生成组件 API
- 🎨 主题轻松自定义，还可创建自己的 Markdown 组件
- 📱 支持移动端组件库研发，内置移动端高清渲染方案
- 📡 一行命令将组件资产数据化，与下游生产力工具串联

## 快速上手

### 环境准备

首先得有 [node](https://nodejs.org/en/)，并确保 node 版本是 10.13 或以上。

```bash
$ node -v
v10.13.0
```

### 脚手架初始化

为了方便使用，dumi 提供了两种不同的脚手架，两者的区别可以查看 [Config - mode](/zh-CN/config#mode)。我们需要先找个地方建个空目录，然后再使用脚手架：

```bash
$ mkdir myapp && cd myapp
```

#### 组件开发脚手架

组件库开发脚手架除了包含 dumi 和基础的文档外，还包含一个简单的组件、umi-test 和 father-build，可轻松实现开发组件、编写文档、编写测试用例、打包组件的全流程。

```bash
$ npx @umijs/create-dumi-lib        # 初始化一个文档模式的组件库开发脚手架
# or
$ yarn create @umijs/dumi-lib

$ npx @umijs/create-dumi-lib --site # 初始化一个站点模式的组件库开发脚手架
# or
$ yarn create @umijs/dumi-lib --site
```

#### 静态站点脚手架

静态站点脚手架即一个多语言的站点模式脚手架，仅包含文档。

```bash
$ npx @umijs/create-dumi-app
# or
$ yarn create @umijs/dumi-app
```

### 仓库模板初始化

我们也可以使用 `dumi-template` 仓库进行初始化，访问 https://github.com/umijs/dumi-template 了解更多。

![](https://gw.alipayobjects.com/zos/bmw-prod/91791904-cdde-4408-959d-72fd0c9049b1/kj80x6lv_w1918_h352.png)

### 开始开发

执行 `npm run dev` 或 `npx dumi dev` 即可开始调试组件或编写文档：

![](https://gw.alipayobjects.com/zos/bmw-prod/a74b9643-b1db-48b0-83b1-67d15e13b6fc/k7a3sl0s_w1988_h1310.png)

### 构建及部署

执行 `npm run docs:build` (组件开发脚手架) / `npm run build`（静态站点脚手架), 或 `npx dumi build` 即可对我们的文档站点做构建，构建产物默认会输出到 `dist` 目录下，我们可以将 `dist` 目录部署在 now.sh、GitHub Pages 等静态站点托管平台或者某台服务器上。
