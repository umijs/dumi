---
group: 基础
---

# 页面渲染配置

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

## 捕获 `fixed` 元素

设置 `transform` 为 `true`，可使得内部 `position: fixed;` 元素相对于 Demo 包裹器定位：

```jsx
/**
 * transform: true
 */

import React from 'react';

export default () => (
  <h1 style={{ position: 'fixed', top: 0, left: 0 }}>我不会飞出去</h1>
);
```

## 修改背景色

通过 `background` 配置项，可以修改它的背景颜色、渐变甚至加上背景图片，dumi 会将其当做 CSS 属性值处理，比如配置 `background` 为 `'#f6f7f9'`：

```jsx
/**
 * background: '#f6f7f9'
 */

import React from 'react';

export default () => null;
```

## 不需要内边距

配置 `compact` 为 `true`，则会移除所有内边距：

```jsx
/**
 * compact: true
 */

import React from 'react';

export default () => '我会贴边站';
```

## 标题与简介

通过 `title` 和 `description` 配置 demo 的标题和简介：

```jsx
/**
 * title: 我是标题
 * description: 我是简介，我可以用 `Markdown` 来编写
 */

import React from 'react';

export default () => null;
```

## 直接嵌入文档

配置 `inline` 为 `true` 则不会展示包裹器、直接在文档里嵌入 demo：

<pre lang="markdown">
```jsx
/**
 * inline: true
 */

import React from 'react';

export default () => '我会被直接嵌入';
```
</pre>

就像这样：

```jsx
/**
 * inline: true
 */

import React from 'react';

export default () => '我会被直接嵌入';
```

## 调试型 demo

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
      dependencies: {
        'index.tsx': {
          type: 'FILE',
          value:
            "/**\n * debug: true\n */\n\nimport React from 'react';\n\nexport default () => '我仅在开发环境下展示';",
        },
      },
    }}
    debug
  >
    我仅在开发环境下展示
  </Previewer>
);
```

## iframe 模式

设置 `iframe` 为 `true`，将会使用 `iframe` 渲染 demo，可实现和文档的完全隔离，通常用于布局型组件，此时 [`compact`](/config/demo#compact) 配置默认为 `true`：

```jsx
/**
 * iframe: true // 设置为数值可控制 iframe 高度
 */
import React from 'react';

export default () => (
  <h2 style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.1)', padding: '5px 20px' }}>
    iframe 模式
  </h2>
);
```
