---
title: 快速上手
order: 9
nav:
  order: 10
---

# 快速上手

## 安装

在组件项目开发目录下执行以下命令进行安装：

```bash
$ npm i dumi -D
```

## 小试牛刀

dumi 默认会搜寻 `src` 及 `docs` 目录下的 `.md` 文件，然后根据文件目录结构及 FrontMatter 配置来生成路由，当然这些默认行为可以通过配置进行修改。

我们先创建我们的第一个文档页面：

```bash
$ echo '# Hello World!' > src/index.md
```

然后直接执行：

```bash
$ dumi dev
```

我们将在浏览器中看到我们的第一个文档页面！

## 嵌入 Demo

但这只是普普通通的文档，接下来我们尝试在 `index.md` 中嵌入一个 Demo 试试看，输入：

<pre>
``` jsx
import React from 'react';

export default () => &lt;button&gt;Hello World!&lt;/button&gt;
```
</pre>

一个内容为 Hello World! 的 Button 将会出现在页面上，就像这样：

```jsx
import React from 'react';

export default () => <button>Hello World!</button>;
```

页面上所有的 jsx/tsx 代码块，都会被 dumi 自动转换为嵌入式 Demo，如果你确实希望展示一段 jsx/tsx 的代码块，可以使用 `pure` 修饰符，像这样：

<pre>
``` jsx | pure
不希望被转换为 Demo 的代码
```
</pre>

看起来有点儿意思了，但写 Demo 可是件精细的活儿，想掌握更多编写 Demo 的技巧，请查看 <a href="#/write-demo">好好写 Demo</a>。
