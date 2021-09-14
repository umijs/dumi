---
title: 进阶使用
order: 3
toc: menu
---

## 多语言

让文档站点变成多语言这件事，对 dumi 用户来说是开箱即用的。比如我们使用英文编写了 `docs/index.md` 作为站点的首页，现在希望增加站点的中文版本，只需要创建一个带 `zh-CN` locale 后缀的同名 Markdown 文件即可：

<Tree>
  <ul>
    <li>
      docs
      <ul>
        <li>
          index.md
          <small>已有的英文版首页</small>
        </li>
        <li>
          index.zh-CN.md
          <small>新创建的中文版首页</small>
        </li>
      </ul>
    </li>
  </ul>
</Tree>

这样一来，当用户访问 `www.example.com` 时 dumi 会渲染英文版首页，访问 `www.example.com/zh-CN` 时 dumi 会渲染中文版首页，对于其他页面也是一样的，就像你正在浏览的 dumi 的官网一样。

### 默认语言

在 dumi 的默认配置中，`en-US` 是默认语言，`zh-CN` 是第二种语言，如果你需要修改这个配置，比如修改默认语言、或者添加更多语言，请查看 [配置项 - locales](/zh-CN/config#locales) 配置项。

### 翻译缺失

文档的翻译工作通常都是渐进式进行的，势必会存在『文档翻译到一半』的过渡期，为了让这个过渡期更加友好，**dumi 会将默认语言的文档作为未翻译语言的兜底文档**，举个例子：

<Tree>
  <ul>
    <li>
      docs
      <ul>
        <li>index.md</li>
        <li>index.zh-CN.md</li>
        <li>missing.md</li>
      </ul>
    </li>
  </ul>
</Tree>

很显然 `missing.zh-CN.md` 是缺失的，用户在访问 `www.example.com/zh-CN/missing` 时，dumi 会把 `missing.md` 的内容呈现给用户。

## Umi 项目集成模式

除了独立的组件库以外，我们大多数的项目还会有自己的内部组件，这些内部的组件库管理通常是一个很头疼的问题，既不需要发布单独的 npm 包，又需要进行迭代、更新、说明、交接；为了让项目内部组件库管理这件事变得更加轻松，dumi 推出了 Umi 项目集成模式：

- **自动探测**：当 `dependencies` 或 `devDependencies` 中包含 `umi` 和 `@umijs/preset-dumi` 时，进入集成模式（不再需要单独安装 `dumi` 这个包）
- **相互隔离**：所有 dumi 文档都会集中在 `/~docs` 路由下，与原项目相互隔离、互不干扰，可以理解为标准 dumi 文档都加了一个特定路由前缀，也包括用户的导航和菜单路由配置
- **不影响生产**：仅在 `NODE_ENV` 是 `development` 时集成，不影响项目的生产构建
- **可单独构建**：如果需要单独构建文档做部署，可执行 `umi build --dumi`，即可得到一份非集成模式的 dumi 站点产物，`--dumi` 在 `umi dev` 命令下也是可用的

使用方式很简单：在已有 Umi 项目中安装 `@umijs/preset-dumi` 到 `devDependencies` 中，再根据需要配置 `resolve.includes` 即可（比如约定 `src/components` 目录下为业务组件库和组件库对应的文档）。

## UI 资产数据化

如何理解资产？从开发者视角狭义的理解，只要是生产出来可以帮助下游提效的实体，都可以称之为资产，比如组件、文档、组件 API、组件 demo 等等。

我们在组件研发的过程中，无时无刻不在创建着资产。发布的 npm 包自然是资产，编写的 TypeScript 类型定义、精心准备的组件库 demo 也都是资产，现在只需一行命令，即可将 dumi 与开发者共同完成的资产数据化，这份数据可以跟随 npm 包迭代、发布，进而流转给下游工具使用。

此处拿下游工具——Umi UI 作为例子演示资产数据化的使用流程，如下图所示：

<p style="text-align: center;">
  <img src="https://gw.alipayobjects.com/zos/bmw-prod/a873195d-32fe-427d-9756-a002d7644d85/kc5y7qpk_w2078_h1757.png" width="800" >
</p>

### 1. 初始化 dumi 组件开发项目

```bash
$ mkdir dumi-lib && cd dumi-lib
$ npx @umijs/create-dumi-lib
```

### 2. 为 demo 添加资产元信息

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

export default () => <Foo title="First Demo" />;
```
</pre>

除了在源代码中编写 frontmatter 以外，给外部 demo 的 `code` 标签添加属性，也能实现元信息的添加：

```html
<code
  src="/path/to/demo.tsx"
  title="demo 的名称"
  thumbnail="demo 的预览缩略图地址"
  previewUrl="预览的 URL 地址"
/>
```

### 3. 启用元数据生成能力

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

### 4. 构建并生成资产元数据

如果只是用于测试，可以用 `npm version` 来代替 `npm publish`，随后用 link 进行本地玩耍：

```bash
$ npm run build
$ npm version patch -m "build: bump version to %s"
```

### 5. 在 Umi UI 中使用

初始化 Umi 应用，安装 Umi UI 并 link 我们刚刚的组件库：

```bash
$ mkdir umi-app && cd umi-app
$ npx @umijs/create-dumi-app
$ npm i @umijs/preset-ui -D
$ npm link path/to/dumi/lib
```

在 Umi 应用的 `package.json` 中，手动添加组件库为依赖：

```diff
{
  "dependencies": {
    // 其他依赖
+   "your-lib-package-name": "*"
  }
}
```

然后和往常一样启动 Umi 项目，即可在 Umi UI 的迷你气泡中看到 dumi-lib 项目中的 demo 资产，并可直接插入到页面中使用：

<p style="text-align: center;">
  <img src="https://gw.alipayobjects.com/zos/bmw-prod/4102a494-e4d8-494e-a790-1a7a5562da51/kc6gnqjd_w680_h387.gif" width="680">
</p>

## 移动端组件研发

使用方式很简单，初始化 dumi 项目后、安装 `dumi-theme-mobile` 到 `devDependencies` 中即可，dumi 将会从默认的 PC 组件库研发切换为移动端组件研发。

<img style="border: 1px solid #eee;" src="https://gw.alipayobjects.com/zos/bmw-prod/acb29a94-6200-4798-82eb-190177fa841c/kezwf18r_w2556_h1396.jpeg" alt="移动端主题预览效果" />

访问 [主题列表 - mobile](/zh-CN/theme#dumi-theme-mobile) 了解更多移动端主题的特性及高清方案。

## 组件 API 自动生成

现在，我们可以通过 JS Doc 注解 + TypeScript 类型定义的方式实现组件 API 的自动生成了！

### 组件源码中的类型和注解

组件 API 自动生成的前提是，确保 dumi 能够通过 TypeScript 类型定义 + 注解推导出 API 的内容，例如 `Hello` 组件的源代码：

```tsx | pure
import React from 'react';

export interface IHelloProps {
  /**
   * 可以这样写属性描述
   * @description       也可以显式加上描述名
   * @description.zh-CN 还支持不同的 locale 后缀来实现多语言描述
   * @default           支持定义默认值
   */
  className?: string; // 支持识别 TypeScript 可选类型为非必选属性
}

const Hello: React.FC<IHelloProps> = () => <>Hello World!</>;

export default Hello;
```

dumi 背后的类型解析工具是 `react-docgen-typescript`，更多类型和注解的用法可参考 [它的文档](https://github.com/styleguidist/react-docgen-typescript#example)。

### 在文档中展示 API

有了能够推导 API 的源代码，我们就可以在 Markdown 中通过 `API` 内置组件来渲染 API 表格：

```md
<!-- 不传递 src 将自动探测当前组件，比如 src/Hello/index.md 将会识别 src/Hello/index.tsx -->

<API></API>

<!-- 传递 src 将显式指明渲染哪个组件的 API -->

<API src="/path/to/your/component.tsx"></API>

<!-- src 可使用 alias -->

<API src="@/your/component.tsx"></API>

<!-- 传递 exports 将显式指明渲染哪些导出，请确保值为合法的 JSON 字符串 -->

<API exports='["default", "Other"]'></API>

<!-- 如果不需要 API 相关标题 ，可以使用hideTitle -->

<API hideTitle></API>

```

效果大致如下：

<API src="../.demos/Hello/index.tsx"></API>

> `src` 使用 `alias` 时，内置 `@` 与 `@@` 不生效，还需要在配置文件中手动指定 `alias`。

### 自定义 API 表格渲染

和其他内置组件一样，`API` 组件也支持通过 theme API 进行复写，只需要创建 `.dumi/theme/builtins/API.tsx`（本地主题）或者创建一个包含 `API.tsx` 的主题包，结合 `dumi/theme` 暴露的 `useApiData` hook，即可自行控制 API 表格的渲染，可参考 dumi 默认主题的 [API 组件实现](https://github.com/umijs/dumi/blob/master/packages/theme-default/src/builtins/API.tsx)。

