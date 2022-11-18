---
group:
  title: 高级
  order: 2
---

# UI 资产元数据

如何理解资产？从开发者视角狭义的理解，只要是生产出来可以帮助下游提效的实体，都可以称之为资产，比如组件、文档、组件 API、组件 demo 等等。

我们在组件研发的过程中，无时无刻不在创建着资产。发布的 npm 包自然是资产，编写的 TypeScript 类型定义、精心准备的组件库 demo 也都是资产，现在只需一行命令，即可将 dumi 与开发者共同完成的资产数据化，这份数据可以跟随 npm 包迭代、发布，进而流转给下游工具使用。

此处拿下游工具——Umi UI 作为例子演示资产数据化的使用流程，如下图所示：

<p style="text-align: center;">
  <img src="https://gw.alipayobjects.com/zos/bmw-prod/a873195d-32fe-427d-9756-a002d7644d85/kc5y7qpk_w2078_h1757.png" width="800" >
</p>

## 1. 初始化 dumi 组件开发项目

```bash
$ mkdir dumi-lib && cd dumi-lib
$ npx create-dumi
```

## 2. 为 demo 添加资产元信息

以初始化项目的 demo 为例，打开 `src/Foo/index.md`，添加如下 frontmatter 配置：

<pre lang="diff">
// src/Foo/index.md

```jsx
+ /**
+  * title: Foo demo
+  * thumbnail: [缩略图的 URL 地址]
+  * previewUrl: [预览的 URL 地址]
+  */
import React from 'react';
import { Foo } from 'dumi-lib';

export default () => &lt;Foo title="First Demo" /&gt;;
```
</pre>

除了在源代码中编写 frontmatter 以外，给外部 demo 的 `code` 标签添加属性，也能实现元信息的添加：

```html
<code
  src="/path/to/demo.tsx"
  title="demo 的名称"
  thumbnail="demo 的预览缩略图地址"
  previewUrl="预览的 URL 地址"
></code>
```

## 3. 启用元数据生成能力

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

## 4. 构建并生成资产元数据

如果只是用于测试，可以用 `npm version` 来代替 `npm publish`，随后用 link 进行本地玩耍：

```bash
$ npm run build
$ npm version patch -m "build: bump version to %s"
```
