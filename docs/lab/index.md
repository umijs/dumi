---
title: 实验室
nav:
  title: 实验室
sidemenu: false
---

<Alert>
实验室的功能仅在 <code>next</code> 版本中提供，可以使用 <code>npm i dumi@next</code> 安装实验版本进行体验；实验性质的功能可能不稳定，请谨慎用于生产；如果体验后有任何建议，欢迎在讨论群中进行反馈和交流 ❤
</Alert>

## 移动端组件研发

**依赖版本：**`dumi@1.1.0-beta.18+` & `dumi-theme-mobile`

使用方式很简单，确保项目是 dumi 最新的 beta 版且安装 `dumi-theme-mobile` 到 `devDependencies` 中即可，dumi 将会从默认的 PC 组件库研发切换为移动端组件研发。目前包含如下能力：

1. sticky 手机模拟容器 + iframe 预览 demo
2. 预览 demo 时自动处理 rem（基于 umi-hd 的 [750 模式](https://github.com/umijs/umi-hd#%E6%95%B4%E4%BD%93%E4%BB%8B%E7%BB%8D)）
3. 提供二维码便于真机预览

<img style="border: 1px solid #eee;" src="https://gw.alipayobjects.com/zos/bmw-prod/acb29a94-6200-4798-82eb-190177fa841c/kezwf18r_w2556_h1396.jpeg" alt="移动端主题预览效果" />

## Motions

**依赖版本：**`dumi@1.1.0-beta.13+`

中文名还没想好，可以理解为 Demo 动作，开发者如果在编写 Demo 的时候预先写好 `motions`，比如这么写：

```tsx | pure
/**
 * motions:
 *  - click:[data-action="addon"]
 *  - timeout:1000
 *  - click:[data-action="addon"]
 *  - timeout:1000
 *  - click:[data-action="reset"]
 */
import React, { useState } from 'react';

export default () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <p>{count}</p>
      <button type="button" data-action="addon" onClick={() => setCount(count + 1)}>
        增加
      </button>
      <button type="button" data-action="reset" onClick={() => setCount(0)}>
        重置
      </button>
    </>
  );
};
```

将会得到如下 Demo，尝试点击操作栏上的播放按钮，开发者预先定义好的 `motions` 将会依次执行：

```tsx
/**
 * motions:
 *  - click:[data-action="addon"]
 *  - timeout:1000
 *  - click:[data-action="addon"]
 *  - timeout:1000
 *  - click:[data-action="reset"]
 */
import React, { useState } from 'react';

export default () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <p>{count}</p>
      <button type="button" data-action="addon" onClick={() => setCount(count + 1)}>
        增加
      </button>
      <button type="button" data-action="reset" onClick={() => setCount(0)}>
        重置
      </button>
    </>
  );
};
```

目前支持如下 `motion` 语法：

- `autoplay`: 在首位时该 motion 将会自动执行，未来会再支持 `loop` 以实现循环播放
- `click:selector`: 冒号后面跟随的是 CSS 选择器，用于点击某个选择器
- `timeout:number`: 冒号后面跟随的是数字，用于等待一定时间再执行下一步，比如等待过渡动画完成
- `capture:selector`: 冒号后面跟随的是 CSS 选择器，用于 `postMessage` 该选择器，可在未来结合 snapshot 等场景进行扩展，发出的 message data 内容为：
  ```js
  { type: 'dumi:capture-element', value: 'selector' }
  ```

## 自定义主题

**依赖版本：**`dumi@1.1.0-beta.7+`

### 开发方式

#### 目录结构

方式一，创建包名为 `dumi-theme-` or `@group/dumi-theme-` 开头的包，目录结构以默认主题为例：

```bash
.
├── package.json
└── src
    ├── builtins      # [约定] 内置组件文件夹，dumi 会寻找**一级目录**下的 `j|tsx` 进行挂载，该文件夹下的组件可直接在 md 中使用
    ├── components    # [非约定] 主题包自身为了可维护性抽取出来的组件，文件夹名称随开发者自定义
    ├── layout.tsx    # [约定] 自定义的 layout 组件，props.children 即每个 md 的内容，开发者可自行控制导航、侧边栏及内容渲染
    ├── layouts       # [约定] 自定义的 layouts 目录，在需要自定义多个 layout 时使用
    │   ├── index.tsx # [约定] 等同于 src/layout.tsx，两种方式二选一，layout.tsx 优先级更高
    │   └── demo.tsx  # [约定] 自定义组件 demo 单独路由（~demos/:uuid）的 layout
    └── style         # [非约定] 主题包的样式表
```

其中 `[约定]` 意味着是主题生效的必备结构，`[非约定]` 则意味着开发者可以根据自己的习惯进行控制。

方式二，在本地项目中创建 `.dumi/theme` 文件夹，**将该文件夹当做上面的 `src` 目录，直接编写自定义主题即可**，例如，创建 `.dumi/theme/layout.tsx` 以自定义 layout；此方式适用于不需要发布的主题包，也更容易进行调试。

#### 组件兜底

支持部分覆盖官方主题的组件，如果主题包没有在 `builtins` 下面提供，dumi 则会兜底到默认主题的 `Previewer` 组件。会进行兜底的组件如下：

1. `Previewer.tsx` - 渲染 demo 包裹器
2. `SourceCode.tsx` - 渲染代码块并高亮
3. `Alert.tsx` - 渲染提示框
4. `Badge.tsx` - 渲染标签

另外，`layout.tsx`（或 `layouts/index.tsx`）也会进行兜底，如果只希望控制正文区域的渲染，可以选择包裹默认主题的 `layout`、控制 `layout` 的 `children` 来实现。例如，给正文区域增加一个反馈按钮：

```tsx | pure
// src/layout.tsx
import React from 'react';
import Layout from 'dumi-theme-default/src/layout';

export default ({ children, ...props }) => (
  <Layout {...props}>
    <>
      <button>反馈</button>
      {children}
    </>
  </Layout>
);
```

#### 主题 API

为了便于自定义主题，dumi 提供了一套主题 API，可以从 `dumi/theme` 中 import 出以下内容：

1. `context` - 可获取到 dumi 的配置项、当前路由的 meta 信息、国际化语言选择项等等，context 的详细定义可 <a target="_blank" href="https://github.com/umijs/dumi/blob/master/packages/preset-dumi/src/theme/context.ts#L8">查看源代码</a>
2. `Link` - 包装后的 umi `Link`，可渲染外链
3. `NavLink` - 包装后的 umi `NavLink`，可渲染外链
4. `AnchorLink` - 包装后的 umi `NavLink`，用于带锚点的链接，且可高亮
5. `useCodeSandbox` - 根据 `Previewer` 的 props 生成一个函数，执行后可在 codesandbox.io 打开该 demo
6. `useCopy` - 提供复制函数及复制的状态，便于实现源代码复制
7. `useSearch` - 根据配置自动提供 algolia 的绑定函数或者根据关键字返回内置搜索的检索结果
8. `useLocaleProps` - 根据 locale 自动过滤 props，便于实现国际化 frontmatter 的定义，比如 `title.zh-CN` 在中文语言下会被转换为 `title`

### 调试及使用

如果开发的主题包是 npm 包的形式，将开发好的主题包 npm link（调试）或 npm install（使用）到项目里，并确保它在 `devDependencies` 或者 `dependencies` 中有声明，dumi 将会自动挂载该主题，例如：

```json
{
  "dependencies": {
    "dumi-theme-default": "0.0.0"
  }
}
```

如果开发的主题包是本地主题 `.dumi/theme` 目录的形式，dumi 会自动挂载，可直接进行调试。

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

在 Umi 应用的 `package.json` 中，手动添加组件库为依赖：

```diff
{
  "dependencies": {
    // 其他依赖
+   "your-lib-package-name": "*"
  }
}
```

然后和往常一样启动 Umi 项目，即可在 Umi UI 的迷你气泡中看到 dumi-lib 项目中的 Demo 资产，并可直接插入到页面中使用：

<p style="text-align: center;">
  <img src="https://gw.alipayobjects.com/zos/bmw-prod/4102a494-e4d8-494e-a790-1a7a5562da51/kc6gnqjd_w680_h387.gif" width="680">
</p>
