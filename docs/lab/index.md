---
title: Lab
nav:
  title: Lab
sidemenu: false
---

<Alert>
The functions of the laboratory are only works in the <code>next</code> version, you can use <code>npm i dumi@next</code> to install the experimental version for experience; The experimental functions are unstable, please do not use it in production; If you have any suggestions, welcome to feedback and exchanges in the discussion group ❤
</Alert>

## Umi inregrated mode

**Dependent version:**`dumi@1.1.0-beta.28+`

When we are working a business project, it is a big headache for us to manage the components within project, because these components no need to release a npm package, but also need to be iterated, updated, documented, and handed over; The Umi interagted mode was born for this scene, it includes:

- **Auto-detecting**: The integrated mode will be activated when the `dependencies` or `devDependencies` includes `umi` & `@umijs/preset-dumi` (`dumi` pacakge no longer needed)
- **Routes isolation**: All the dumi docs will be created under the `/~docs` route, it is isolated from the original project, just like prefix a specific path for all the dumi routes, user's menus and user's navs
- **Only development**: The Integrated moode only activate when the `NODE_ENV` is `development`, does not includes in the production bundle
- **Solo support**: We can get the non-integrated docs bundle for deployment via `umi build --dumi`, also available in `umi dev`

To use the integrated mode, we can install the `@umijs/preset-dumi` into `devDependencies`, and configure `resolve.includes` as project needed (for example, use `src/components` as project's components directory).

## Auto-gen component API

**Dependent version:**`dumi@1.1.0-beta.27+`

Now, we can get auto-gen component API tables via JS Doc + TypeScript definitions!

### Type & doc comment in source code

For generating API automatically, we need to ensure that dumi can devise the content of API via correct TypeScript definitions and doc comments. For example the `Hello` component:

```tsx | pure
import React from 'react';

export interface IHelloProps {
  /**
   * write description here
   * @description       also can write description with property name
   * @description.zh-CN support to write description for different locales
   * @default           support to set default value
   * @required          support to mark required
   */
  className?: string;
}

const Hello: React.FC<IHelloProps> = () => <>Hello World!</>;

export default Hello;
```

The API parse behind dumi is `react-docgen-typescript`，check out its [documentation](https://github.com/styleguidist/react-docgen-typescript#example) to get more definitions & comments usage.

### Show API in documentation

Based on the correct source code, we can render the API table via `API` builtin component in Markdown:

```md
<!-- Omit src for detect target component automatically, for example, src/Hello/index.md will target src/Hello/index.tsx -->

<API></API>

<!-- Pass src will specific component which we need to show API -->

<API src="/path/to/your/component.tsx"></API>

<!-- Pass exports will specific which export should be displayed, make sure the value is a legal JSON string -->

<API exports='["default", "Other"]'></API>
```

After that, we will get:

<API src="../demo/Hello/index.tsx"></API>

### Control API table rendering

Like other builtin components, we can also override the `API` builtin component via theme API, just need to create a `.dumi/theme/builtins/API.tsx` (local theme), or create a theme package that contains the `API.tsx`, and import `useApiData` hook from `dumi/theme`, then we can control rendering as you like. Please refer the implementation of default [API component](https://github.com/umijs/dumi/blob/master/packages/theme-default/src/builtins/API.tsx).

## Markdown file embed

**Dependent version:**`dumi@1.1.0-beta.25+`

In any markdown file, we can embed part or all of the another Markdown file via `embed` tag, it is better to manage our docs:

```md
<!-- Embed all of the content -->

<embed src="/path/to/some.md"></embed>

<!-- Embed specific line of the content via line number -->

<embed src="/path/to/some.md#L1"></embed>

<!-- Embed part of the content via line number range -->

<embed src="/path/to/some.md#L1-L10"></embed>
```

## Develop mobile library

**Dependent versions:**`dumi@1.1.0-beta.18+` & `dumi-theme-mobile`

It is easy to use, just make sure you are using the beta version of dumi, and have been installed the `dumi-theme-mobile` into your dependencies, then dumi will switch to the mobile library development mode. This mode includes the following features:

1. Mobile simulated container with CSS sticky + iframe embedded demo
2. Auto-enable rem ability (Base on [750 mode](https://github.com/umijs/umi-hd#%E6%95%B4%E4%BD%93%E4%BB%8B%E7%BB%8D) of umi-hd）
3. QRCode for preview on the real device

<img style="border: 1px solid #eee;" src="https://gw.alipayobjects.com/zos/bmw-prod/acb29a94-6200-4798-82eb-190177fa841c/kezwf18r_w2556_h1396.jpeg" alt="Mobile theme preview" />

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
9. `useDemoUrl` - Get the single demo page url via demo identifier, for example, `useDemoUrl(props.identifier)` may return like `http://example.com/~demos/demo-id`.

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

**Dependent versions:**`dumi@1.1.0-beta.0+` & `@umijs/preset-ui@2.2.0+`

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
