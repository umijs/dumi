# Demo 理念

dumi 从诞生之初，就有一条重要的 Demo 编写理念：**开发者应该像用户一样写 Demo**。

像用户一样，是指『组件库未来的用户在项目中怎么使用组件，开发者自己在 Demo 里就怎么使用组件』，这意味着开发者编写的 Demo 是能被用户的项目直接使用的。

这条理念可以拆分为 3 个原则。

## 原则一：能看能用

我们在 Demo 中引入组件的时候，很容易写成这样：

```jsx | pure
// 错误示例
import Button from './index.tsx';
import Button from '@/Button/index.tsx';
```

虽然它能在组件库文档里正常运行，但用户在查看文档的时候，却不知道在自己的项目里应当如何引入组件，这样的 Demo 是**只能看不能用**的。

dumi 为了解决这个问题，会自动帮开发者建立组件库 NPM 包 -> 组件库源代码的映射关系，使得我们可以像用户一样引入组件：

```jsx | pure
// 正确示例
// 注：此处假定 package.json 中的 name 是 hello-dumi
import { Button } from 'hello-dumi';
```

## 原则二：依赖清晰

使用 [Umi](https://umijs.org) 开发过项目的朋友可能知道，在写 JSX 时 `React` 的引入不是必须的；但在组件研发场景下，为了确保我们编写的 Demo 复制到任意前端开发框架、任意 React 版本（React 17 的 JSX 转换支持不引入 React）中都能如期运行，Demo 依赖必须足够清晰，所以 React 的引入是必要的：

```jsx | pure
import React from 'react';

export default () => <>Hello World</>;
```

## 原则三：易于维护

用户会在 Markdown 中写项目吗？显然不会。开发者之所以选择直接在 Markdown 中写 Demo，是因为它简单、方便，但倘若某个组件的 Demo 特别复杂，我们却执意在 Markdown 中进行编写，那编写和维护的过程就成了噩梦。

为了能让开发者能和开发组件一样去编写、维护 Demo，dumi 支持从外部引入一个 Demo，就像这样：

```html
<code src="/path/to/Demo.tsx"></code>
```

同时为了使得它能看能用，在用户需要展示 Demo 源代码的时候，dumi 仍然会为用户展示真正的源代码！这样一来，不仅用户的体验丝毫不受影响，开发者也能享受到编辑器带来的 Code Snippets、ESLint、prettier 等强大的功能。

如果你对组件 Demo 的编写也有自己的想法，欢迎到 [dumi 项目讨论区](https://github.com/umijs/dumi/discussions)分享你的经验。
