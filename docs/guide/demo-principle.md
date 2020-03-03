---
group:
  title: 开始写组件 Demo
---

# dumi 的 Demo 理念

dumi 只有一个理念——**开发者应该像用户一样写 Demo**。

这句话如何理解？用户的 Demo 就是实际项目，像用户一样写 Demo 意味着这个 Demo 能直接为实际项目所用，所以它必定要满足下面几个原则。

## 原则一：能看能用

我们在为组件写 Demo 的时候，很容易写成这样：

```jsx | pure
import React from 'react';
import Component from './'; // 错误示例，请勿模仿

export default () => <Component />;
```

这个 Demo 当然能够如预期一般正常运行，但如果用户觉得这个 Demo 可以被用于项目开发、准备拷贝 Demo 源码至项目中的时候，他会发现这个 `./` 的依赖完全无法识别。所以，这样的 Demo，是 **只能看、不能用** 的。

为了解决这个尴尬的问题，dumi 会为开发者自动 alias 当前项目的包，如果是 lerna 项目则会 alias 全部的包，这意味着，我们完全可以像用户一样去引用组件库的依赖，就像这样：

```jsx | pure
import { Component } from 'library-name';
```

这样的 Demo，不仅能让用户直接在项目中使用，也能使得 Demo 在 codesandbox.io 中打开时，也能正常工作。

## 原则二：依赖清晰

由于 Umi 会自动帮我们引入 React，即便我们不引入 React，也能够正常使用 JSX：

```jsx | pure
export default () => <>Hello World</>; // 这样写也是跑得起来的
```

但这样的 Demo 在 online editor 或者其他非 Umi 框架的项目中是无法正常运行的。所以，这样的 Demo 我们认为是**依赖不清晰的**，只要使用了 JSX，我们就应当引入 React：

```jsx | pure
import React from 'react';

export default () => <>Hello World</>; // 这样写也是跑得起来的
```

## 原则三：易于维护

用户会在 Markdown 中写项目吗？显然不会。我们之所以选择直接在 Markdown 中写 Demo，是因为它简单、方便，但倘若某个组件的 Demo 特别复杂，我们却执意在 Markdown 中进行编写，那编写和维护的过程就成了噩梦，就像在 2020 年了我们仍然要使用 Windows 记事本去编程一样。

为了能让开发者能和开发组件一样去编写、维护 Demo，dumi 支持从外部引入一个 Demo，就像这样：

```html
<code src="/path/to/Demo.tsx" />
```

同时为了使得它既能看、也能用，在用户需要展示 Demo 源代码的时候，dumi 仍然会为用户展示真正的源代码！这样以来，不仅用户的体验丝毫不受影响，开发者也能享受到编辑器带来的 Code Snippets、ESLint、prettier 等强大的功能。

如果开发者写的 Demo 用户拷贝过去无法直接运行，那这个 Demo 是『只能看，不能用的』；如果开发者像用户一样写 Demo，那这个 Demo 必定是『既能看，也能用的』。
