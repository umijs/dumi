---
group: 基础
---

# 写组件 demo

dumi 提供了两种编写 demo 的方式，分别应对不同的场景。

## 代码块

如果我们的 demo 非常轻量，建议直接编写代码块，比如：

<pre lang="markdown">
```jsx
import React from 'react';

export default () => <h1>Hello dumi!</h1>;
```
</pre>

`jsx` 和 `tsx` 的代码块将会被 dumi 解析为 React 组件，以上代码块将会被渲染成：

```jsx
import React from 'react';

export default () => <h1>Hello dumi!</h1>;
```

但是在 markdown 代码块中编写代码会失去类型提示和校验，不能像直接在 `tsx` 中那样丝滑，因此我们推荐使用 VSCode 插件 [TS in Markdown](https://github.com/Dali-Team/vscode-ts-in-markdown)。

### 在 demo 中引入组件

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

也许你会有疑问，研发阶段的组件库源代码尚未发布成 NPM 包，怎么才能成功引入组件？无需担心，dumi 会为我们自动建立组件库 NPM 包 -> 组件库源代码的映射关系，即便是 lerna 仓库，也会为每个子包都建立好映射关系。

### 不渲染代码块

如果我们希望某段 `jsx`/`tsx` 代码块被渲染为源代码，可以使用 `pure` 修饰符告诉 dumi：

<pre lang="markdown">
```jsx | pure
// 我不会被渲染为 React 组件
```
</pre>

## 外部 demo

如果我们的 demo 非常复杂，甚至可能有很多外部文件，那么建议使用外部 demo：

```markdown
<code src="/path/to/complex-demo.tsx"></code>
```

和代码块 demo 一样，上述代码也会被渲染为 React 组件，并且外部 demo 的源代码及其他依赖的源代码都可以被用户查看，就像这样：

<code src="./demos/cols.tsx"></code>
