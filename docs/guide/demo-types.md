---
group:
  title: 开始写组件 Demo666
---

# Demo 的类型

在 dumi 中，一共有 3 种 Demo 类型。

## 代码块

dumi 默认会将 `jsx` 和 `tsx` 语言的代码块当做 React Component 进行渲染，该代码块和普通的 module 一样，都需要具备 `export default` 导出，就像这样：

<pre>
```jsx
import React from 'react';

export default () => &lt;h1 style={'{{'} color: '#555' {'}}'}&gt;Hello World!&lt;/h1&gt;;
```
</pre>

它会被 dumi 渲染为这样：

```jsx
import React from 'react';

export default () => <h1 style={{ color: '#555' }}>Hello World!</h1>;
```

当然，如果你完全不希望 dumi 渲染代码块、又或者希望把别的代码块语言当做 React Component 渲染，可以通过 [`config.resolve.previewLangs`](/config#previewlangs) 配置项进行配置。

## 外部引入

为了使得重型 Demo 也能够利于编写和维护，dumi 支持从外部引入一个 React Component 作为 Demo 进行渲染，只需要利用 `code` 标签即可实现：

```html
<code src="/path/to/Demo.tsx" />
```

## 嵌入式

严格来说这不算一种 Demo 类型，而是一种呈现形式。有时候我们希望能够直接为用户呈现一个 Demo，而不是被包裹在一个 Demo 展示容器中，就像这样：

```jsx | inline
import React from 'react';

export default () => <h1 style={{ color: '#555' }}>Hello World!</h1>;
```

可以发现它完全是上面这个 Demo 的嵌入式呈现，这也意味着我们可以通过嵌入式 Demo 对文档页面插入任何需要的组件，脱离 dumi 原生主题能力的限制。

上面两种 Demo 都可以变成嵌入式 Demo，只需要使用 `inline` 属性进行控制即可：

<pre>
// 代码块类型做嵌入式
```jsx | inline
import React from 'react';

export default () => &lt;h1 style={'{{'} color: '#555' {'}}'}&gt;Hello World!&lt;/h1&gt;;
```
</pre>

```jsx | pure
/* 外部 Demo 做嵌入式 */
<code src="/path/to/Demo.tsx" inline />
```
