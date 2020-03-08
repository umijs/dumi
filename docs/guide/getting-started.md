---
title: 快速上手
order: 9
nav:
  order: 10
---

## 环境准备

首先得有 [node](https://nodejs.org/en/)，并确保 node 版本是 10.13 或以上。

```bash
$ node -v
v10.13.0
```

## 脚手架初始化

为了方便使用，dumi 提供了两种不同的脚手架。我们需要先找个地方建个空目录，然后再使用脚手架：

```bash
$ mkdir myapp && cd myapp
```

### 组件开发脚手架

组件库开发脚手架除了包含 dumi 和基础的文档外，还包含一个简单的组件、umi-test 和 father-build，可轻松实现开发组件、编写文档、编写测试用例、打包组件的全流程。

```bash
$ npx @umijs/create-dumi-lib        # 初始化一个文档模式的组件库开发脚手架
# or
$ yarn create @umijs/dumi-lib

$ npx @umijs/create-dumi-lib --site # 初始化一个站点模式的组件库开发脚手架
# or
$ yarn create @umijs/dumi-lib --site
```

### 静态站点脚手架

静态站点脚手架即一个多语言的站点模式脚手架，仅包含文档。

```bash
$ npx @umijs/create-dumi-app
# or
$ yarn create @umijs/dumi-app
```

## 手动初始化

### 安装

建立一个空文件夹，然后在文件夹下执行以下命令进行安装：

```bash
$ npm i dumi -D
```

### 开始写文档

dumi 默认会自动搜寻 `docs`、`src`（或各 lerna 包下的 `src`）目录下的 markdown 文件，我们先来一篇最简单的文档：

```bash
$ mkdir src && echo '# Hello dumi!' > src/index.md
```

然后执行 `dumi dev`，文档将会呈现在你眼前：

![](https://gw.alipayobjects.com/zos/bmw-prod/ed83bd75-06c5-4aa5-a149-5918b072cbee/k7a3kkzb_w1978_h1330.png)

### 写个 Demo 试试看

dumi 会将 `jsx/tsx` 代码块当做 React Component 进行渲染然后放入 Demo 包裹器中，我们将 `src/index.md` 修改为如下内容：

<pre>
# Hello dumi!

```jsx
import React from 'react';

export default () => &lt;h2&gt;First Demo&lt;/h2&gt;;
```
</pre>

保存之后我们的第一个 Demo 就运行起来了：

![](https://gw.alipayobjects.com/zos/bmw-prod/a74b9643-b1db-48b0-83b1-67d15e13b6fc/k7a3sl0s_w1988_h1310.png)

是不是非常简单？但写 Demo 易写好 Demo 难，关于写 Demo 这件事，dumi 有些理念和原则，也想与你分享一下：[dumi 的 Demo 理念](/guide/demo-principle)。
