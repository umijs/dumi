---
nav: 指南
group: 基础
order: 5
mobile: false
---

# 写组件 demo

## 编写方式

dumi 提供了两种编写 demo 的方式，分别应对不同的场景。

### 代码块

如果我们的 demo 非常轻量，建议直接编写代码块，比如：

<pre lang="markdown">
```jsx
import React from 'react';

export default () => &lt;h1&gt;Hello dumi!&lt;/h1&gt;;
```
</pre>

`jsx` 和 `tsx` 的代码块将会被 dumi 解析为 React 组件，以上代码块将会被渲染成：

```jsx
/**
 * defaultShowCode: true
 */

import React from 'react';

export default () => <h1>Hello dumi!</h1>;
```

但是在 markdown 代码块中编写代码会失去类型提示和校验，不能像直接在 `tsx` 中那样丝滑，因此我们推荐使用 VSCode 插件 [TS in Markdown](https://github.com/Dali-Team/vscode-ts-in-markdown)。

#### 不渲染代码块

如果我们希望某段 `jsx`/`tsx` 代码块被渲染为源代码，可以使用 `pure` 修饰符告诉 dumi：

<pre lang="markdown">
```jsx | pure
// 我不会被渲染为 React 组件
```
</pre>

### 外部 demo

如果我们的 demo 非常复杂，甚至可能有很多外部文件，那么建议使用外部 demo：

```markdown
<code src="/path/to/complex-demo.tsx"></code>
```

和代码块 demo 一样，上述代码也会被渲染为 React 组件，并且外部 demo 的源代码及其他依赖的源代码都可以被用户查看，就像这样：

<code src="./demos/cols.tsx"></code>

#### 本地跳过解析

为了方便调试，你可以像 Jest 一样对 `<code />` 标签添加 `skip` 或 `only` 标识（仅在开发环境下有效）以跳过解析，例如：

```html
<code src="./demos/foo.tsx"></code>
<!-- 下面这条将跳过解析 -->
<code src="./demos/bar.tsx" skip></code>
<code src="./demos/baz.tsx"></code>
```

### 如何引入组件

dumi 有一个非常重要的原则——**开发者应该像用户一样使用组件**。

如何理解？假设我们正在研发的组件库 NPM 包名叫做 `hello-dumi`，我们正在为其中的 `Button` 组件编写 demo，下面列举出引入组件的正确方式及错误示例：

```jsx | pure
// 正确示例
import { Button } from 'hello-dumi';

// 错误示例，用户不知道 Button 组件是哪里来的
import Button from './index.tsx';
import Button from '@/Button/index.tsx';
```

当我们的每个 demo 都秉持这一原则时，意味着我们写出的 demo，不仅可以用来调试组件、编写文档，还能被用户直接拷贝到项目中使用。

也许你会有疑问，研发阶段的组件库源代码尚未发布成 NPM 包，怎么才能成功引入组件？无需担心，dumi 会为我们自动建立组件库 NPM 包 -> 组件库源代码的映射关系；如果你的项目是 monorepo，请使用 [`monorepoRedirect` 配置项](../config/index.md#monoreporedirect)来自动建立映射关系，同时也需要在 `tsconfig.json` 中为每个子包配置正确的 `paths` 确保类型可以正确解析。

## 控制 demo 渲染

dumi 提供了一些 FrontMatter 属性，以满足不同的 demo 渲染需求，在**源代码顶部**配置即可：

<pre lang="markdown">
```jsx
/**
 * [配置项名称]: [值]
 */
```
</pre>

对于外部 demo，这些 FrontMatter 属性除了写在源代码里，也可以写在 `code` 标签的属性上：

```html
<code src="/path/to/demo" 配置项="值"></code>
```

dumi 目前支持如下 demo 控制能力。

### 捕获 `fixed` 元素

设置 `transform` 为 `true`，可使得内部 `position: fixed;` 元素相对于 Demo 包裹器定位：

```jsx
/**
 * transform: true
 * defaultShowCode: true
 */
/**
 * transform: true
 */

import React from 'react';

export default () => (
  <h1 style={{ position: 'fixed', top: 0, left: 0 }}>我不会飞出去</h1>
);
```

### 修改背景色

通过 `background` 配置项，可以修改它的背景颜色、渐变甚至加上背景图片，dumi 会将其当做 CSS 属性值处理，比如配置 `background` 为 `'#f6f7f9'`：

```jsx
/**
 * background: '#f6f7f9'
 * defaultShowCode: true
 */
/**
 * background: '#f6f7f9'
 */

import React from 'react';

export default () => null;
```

### 不需要内边距

配置 `compact` 为 `true`，则会移除所有内边距：

```jsx
/**
 * compact: true
 * defaultShowCode: true
 */
/**
 * compact: true
 */

import React from 'react';

export default () => '我会贴边站';
```

### 标题与简介

通过 `title` 和 `description` 配置 demo 的标题和简介：

```jsx
/**
 * title: 我是标题
 * description: 我是简介，我可以用 `Markdown` 来编写
 * defaultShowCode: true
 */
/**
 * title: 我是标题
 * description: 我是简介，我可以用 `Markdown` 来编写
 */

import React from 'react';

export default () => null;
```

### 直接嵌入文档

配置 `inline` 为 `true` 则不会展示包裹器、直接在文档里嵌入 demo：

<pre lang="markdown">
```jsx
/**
 * inline: true
 */

import React from 'react';

export default () => &lt;p&gt;我会被直接嵌入&lt;/p&gt;;
```
</pre>

就像这样：

```jsx
/**
 * inline: true
 */

import React from 'react';

export default () => <p>我会被直接嵌入</p>;
```

### 调试型 demo

设置 `debug` 为 true，则该 demo 仅在开发环境下展示、且会有一个特殊标记：

```jsx
/**
 * inline: true
 */
import React from 'react';
import Previewer from 'dumi/theme/builtins/Previewer';

export default () => (
  <Previewer
    asset={{
      id: 'docs-guide-write-demo-demo-6',
      dependencies: {
        'index.tsx': {
          type: 'FILE',
          value:
            "/**\n * debug: true\n */\n\nimport React from 'react';\n\nexport default () => '我仅在开发环境下展示';",
        },
      },
    }}
    demoUrl=""
    disabledActions={['EXTERNAL']}
    defaultShowCode
    debug
  >
    我仅在开发环境下展示
  </Previewer>
);
```

### iframe 模式

设置 `iframe` 为 `true`，将会使用 `iframe` 渲染 demo，可实现和文档的完全隔离，通常用于布局型组件，此时 [`compact`](/config/demo#compact) 配置默认为 `true`：

```jsx
/**
 * iframe: true
 * compact: true
 * defaultShowCode: true
 */
/**
 * iframe: true
 * compact: true
 */
import React from 'react';

export default () => (
  <h2
    style={{
      boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
      padding: '5px 20px',
      margin: 0,
    }}
  >
    iframe 模式
  </h2>
);
```
