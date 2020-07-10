---
title: 实验室
nav:
  title: 实验室
sidemenu: false
---

<Alert>
实验室的功能仅在 <code>next</code> 版本中提供，可以使用 <code>npm i dumi@next</code> 安装实验版本进行体验；实验性质的功能可能不稳定，请谨慎用于生产；如果体验后有任何建议，欢迎在讨论群中进行反馈和交流 ❤
</Alert>

## 和 Umi UI 一起使用

**依赖版本：**`dumi@1.1.0-beta.0+` & `@umijs/preset-ui@2.2.0+`

使用流程如下图所示：

<p style="text-align: center;">
  <img src="https://gw.alipayobjects.com/zos/bmw-prod/a873195d-32fe-427d-9756-a002d7644d85/kc5y7qpk_w2078_h1757.png" width="800" >
</p>

### 使用方式

#### 1. 初始化 dumi 组件开发项目

```bash
$ mkdir dumi-lib && cd dumi-lib
$ npx @umijs/create-dumi-lib
```

#### 2. 为 Demo 添加资产元信息

以初始化项目的 Demo 为例，打开 `src/Foo/index.md`，添加如下 frontmatter 配置：

<pre lang="diff">
// src/Foo/index.md

```jsx
+ /**
+  * title: Foo Demo
+  * thumbnail: [缩略图的 URL 地址]
+  */
import React from 'react';
import { Foo } from 'dumi-lib';

export default () => <Foo title="First Demo" />;
```
</pre>

除了在源代码中编写 frontmatter 以外，给外部 Demo 的 `code` 标签添加属性，也能实现元信息的添加：

```html
<code src="/path/to/demo.tsx" title="Demo 的名称" thumbnail="Demo 的预览缩略图地址" />
```

#### 3. 启用元数据生成能力

在 `package.json` 中添加一条 npm script，并声明 `dumiAssets` 字段，Umi UI 会根据此字段查找资产元数据文件：

```diff
{
  "scripts": {
+   "postversion": "dumi assets"
  },
+ "dumiAssets": "assets.json"
}
```

由于 `assets.json` 不需要参与版本控制，请在 `gitignore` 中添加 `assets.json`。

#### 4. 构建并生成资产元数据

如果只是用于测试，可以用 `npm version` 来代替 `npm publish`，随后用 link 进行本地玩耍：

```bash
$ npm run build
$ npm version patch -m "build: bump version to %s"
```

#### 5. 在 Umi UI 中使用

初始化 Umi 应用，安装 Umi UI 并 link 我们刚刚的组件库：

```bash
$ mkdir umi-app && cd umi-app
$ npx @umijs/create-dumi-app
$ npm i @umijs/preset-ui -D
$ npm link path/to/dumi/lib
```

然后和往常一样启动 Umi 项目，即可在 Umi UI 的迷你气泡中看到 dumi-lib 项目中的 Demo 资产，并可直接插入到页面中使用：

<p style="text-align: center;">
  <img src="https://gw.alipayobjects.com/zos/bmw-prod/4102a494-e4d8-494e-a790-1a7a5562da51/kc6gnqjd_w680_h387.gif" width="680">
</p>
