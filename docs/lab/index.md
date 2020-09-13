---
title: lab
nav:
  title: Laboratory
sidemenu: false
---

<Alert>
The functions of the laboratory are only works in the <code>next</code> version, you can use <code>npm i dumi@next</code> to install the experimental version for experience; The experimental functions are unstable, please do not use it in production; If you have any suggestions, welcome to feedback and exchanges in the discussion group ❤
</Alert>

## 移动端组件研发

**依赖版本：**`dumi@1.1.0-beta.18+` & `dumi-theme-mobile`

使用方式很简单，确保项目是 dumi 最新的 beta 版且安装 `dumi-theme-mobile` 到 `devDependencies` 中即可，dumi 将会从默认的 PC 组件库研发切换为移动端组件研发。目前包含如下能力：

1. sticky 手机模拟容器 + iframe 预览 demo
2. 预览 demo 时自动处理 rem（基于 umi-hd 的 [750 模式](https://github.com/umijs/umi-hd#%E6%95%B4%E4%BD%93%E4%BB%8B%E7%BB%8D)）
3. 提供二维码便于真机预览

<img style="border: 1px solid #eee;" src="https://gw.alipayobjects.com/zos/bmw-prod/acb29a94-6200-4798-82eb-190177fa841c/kezwf18r_w2556_h1396.jpeg" alt="移动端主题预览效果" />

## Motions

**Dependent version:**`dumi@1.1.0-beta.13+`

The name has not been thought out yet, it can be understood as a Demo action. If the developer writes `motions` in advanced when writing a Demo, for example, write it like this:

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
        add
      </button>
      <button type="button" data-action="reset" onClick={() => setCount(0)}>
        reset
      </button>
    </>
  );
};
```

You will get the following Demo, try to click the play button on the operation bar, the `motions` predefined by developer will be executed in sequence:

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
        add
      </button>
      <button type="button" data-action="reset" onClick={() => setCount(0)}>
        reset
      </button>
    </>
  );
};
```

Currently supports the following `motion` syntax:

- `autoplay`: The motion will be executed automatically in the first place, and `loop` will be supported in the future
- `click:selector`: here is a CSS selector, which is used to click on a selector
- `timeout:number`: here is a number, which is used to wait for a time before executing the next step, such as waiting for the transition animation to complete
- `capture:selector`: here is a CSS selector, which is used for `postMessage`. This selector can be extended in the future in combination with snapshots and other scenarios. The content of the message data sent is like:
  ```js
  { type: 'dumi:capture-element', value: 'selector' }
  ```

## Custom theme

**Dependent version:**`dumi@1.1.0-beta.7+`

### Development

#### Directory Structure

Method one, Create a package starting with `dumi-theme-` or `@group/dumi-theme-`, here takes a theme using the default as an example:

```bash
.
├── package.json
└── src
    ├── builtins      # [Convention] Built-in component folder, dumi will look for `j|tsx` in **first-level directory** to mount, the components in this folder can be used directly in md
    ├── components    # [Non-Convention] The components extracted by the theme package in this folder. The folder name is customized by the developer
    ├── layout.tsx    # [Convention] You can custom your own layout component, props.children is the content of each markdown, developers can control the navigation, sidebar and content rendering by themselves
    ├── layouts       # [Convention] A custom layouts directory, used when you need to customize multiple layouts
    │   ├── index.tsx # [Convention] Same as src/layout.tsx, choose one of the two methods, layout.tsx has higher priority
    │   └── demo.tsx  # [Convention] Separate route (~demos/:uuid) layout for custom component demo
    └── style         # [Non-Convention] Theme package style sheet
```

Here, `[Convention]` means a necessary structure for the theme package, and `[Non-Convention]` means that developers can control according to their own habits.

Method two, create a `.dumi/theme` folder in the local project, **consider this folder as the `src` directory above, and write a custom theme directly**, for example, create `.dumi/theme/layout.tsx` to customize the layout; This method is suitable for theme packages that do not need to be released, which is easier to debug.

#### Component Guarantee

It supports components that partially cover the official theme. If the theme package is not provided in `builtins`, dumi will guarantee to the default theme `Previewer` component. The components that will be guaranteed are as follows:

1. `Previewer.tsx` - For demo wrapper
2. `SourceCode.tsx` - For code block and highlighting it
3. `Alert.tsx` - For alert box
4. `Badge.tsx` - For badge

In addition, `layout.tsx` (or `layouts/index.tsx`) will also be guaranteed. If you only want to control the rendering of the text area, you can choose to wrap the `layout` of the default theme, and code the `children` of `layout` to achieve. For example, add a feedback button to the text area:

```tsx | pure
// src/layout.tsx
import React from 'react';
import Layout from 'dumi-theme-default/src/layout';

export default ({ children, ...props }) => (
  <Layout {...props}>
    <>
      <button>feedback</button>
      {children}
    </>
  </Layout>
);
```

#### Theme API

In order to customize the theme, dumi provides a set of theme APIs, you can import the following from `dumi/theme`:

1. `context` - You can get the configurations of dumi, meta information of the current route, international language options, etc. The detailed definition of the context can be viewd <a target="_blank" href="https://github.com/umijs/dumi/blob/master/packages/preset-dumi/src/theme/context.ts#L8">source code</a>
2. `Link` - The wrapped umi `Link` can render external links
3. `NavLink` - The wrapped umi `NavLink` can render external links
4. `AnchorLink` - The wrapped umi `NavLink` can be used for links with anchor points, and can be highlighted
5. `useCodeSandbox` - Generate a function based on the props of `Previewer`, and open the demo in codesandbox.io
6. `useCopy` - Provide copy function and copy status to achieve to copy source code
7. `useSearch` - Automatically provide algolia binding functions according to configuration or return search results according to keywords
8. `useLocaleProps` - Automatically filter props according to locale to achieve to the definition of international frontmatter. For example, `title.zh-CN` will be converted to `title` in Chinese language

### Debug and usage

If the developed theme package is a npm package, take the developed theme package npm link (debugging) or npm install (used) into the project, and make sure that it is declared in `devDependencies` or `dependencies`, dumi will automatically mount this theme, for example:

```json
{
  "dependencies": {
    "dumi-theme-default": "0.0.0"
  }
}
```

If the developed theme package is in the form of the `.dumi/theme` directory, dumi will automatically mount it and you can debug directly.

## Use with Umi UI

**Dependent version:**`dumi@1.1.0-beta.0+` & `@umijs/preset-ui@2.2.0+`

The usage process is shown in the figure below:

<p style="text-align: center;">
  <img src="https://gw.alipayobjects.com/zos/bmw-prod/a873195d-32fe-427d-9756-a002d7644d85/kc5y7qpk_w2078_h1757.png" width="800" >
</p>

### Usage

#### 1. Initialize the dumi component to develop project

```bash
$ mkdir dumi-lib && cd dumi-lib
$ npx @umijs/create-dumi-lib
```

#### 2. Add asset meta information for Demo

Take the demo of the getting-started project as an example, open `src/Foo/index.md` and add the following frontmatter configuration:

<pre lang="diff">
// src/Foo/index.md

```jsx
+ /**
+  * title: Foo Demo
+  * thumbnail: [The url of thumbnail]
+  */
import React from 'react';
import { Foo } from 'dumi-lib';

export default () => <Foo title="First Demo" />;
```
</pre>

In addition to writing frontmatter in the source code, adding attributes to the `code` tag of the external Demo can also add meta information:

```html
<code src="/path/to/demo.tsx" title="Demo title" thumbnail="the url of thumbnail" />
```

#### 3. Enable metadata generation capabilities

Add an script to `package.json` and declare the `dumiAssets` field, Umi UI will find asset metadata files based on this field:

```diff
{
  "scripts": {
+   "postversion": "dumi assets"
  },
+ "dumiAssets": "assets.json"
}
```

Since `assets.json` does not need to control versions , please add `assets.json` to `gitignore`.

#### 4. Build and generate asset metadata

If it is just for testing, you can use `npm version` instead of `npm publish`, and then use link for testing:

```bash
$ npm run build
$ npm version patch -m "build: bump version to %s"
```

#### 5. Use in Umi UI

Initialize the Umi application, install Umi UI and link the component library we just made:

```bash
$ mkdir umi-app && cd umi-app
$ npx @umijs/create-dumi-app
$ npm i @umijs/preset-ui -D
$ npm link path/to/dumi/lib
```

In the `package.json` of the Umi application, manually add the component library as a dependency:

```diff
{
  "dependencies": {
    // other dependencies
+   "your-lib-package-name": "*"
  }
}
```

Then start the Umi project as usual, you can see the Demo assets in the dumi-lib project in the floating bubble of Umi UI, and can be directly inserted into the page for using:

<p style="text-align: center;">
  <img src="https://gw.alipayobjects.com/zos/bmw-prod/4102a494-e4d8-494e-a790-1a7a5562da51/kc6gnqjd_w680_h387.gif" width="680">
</p>
