---
title: 快速上手
order: 9
---

## 安装

在组件项目开发目录下执行以下命令进行安装：

``` bash
$ npm i father-doc@next -D
```

## 小试牛刀

father-doc 默认会搜寻 `src` 及 `docs` 目录下的 `.md` 文件，然后根据文件目录结构及 FrontMatter 配置来生成路由，当然这些默认行为可以通过配置进行修改。

我们先创建我们的第一个文档页面：

``` bash
$ echo '# Hello World!' > src/index.md
```

然后直接执行：

``` bash
$ father-doc dev
```

我们将在浏览器中看到我们的第一个文档页面！

## 嵌入式 Demo

但这只是普普通通的文档，接下来我们尝试嵌入一个 Demo 试试看：

``` bash
$ echo '\n\n``` jsx\nexport default () => <button>Hello World!</button>;\n```' >> src/index.md
```

一个内容为 Hello World! 的 Button 将会出现在页面上，就像这样：

``` jsx
export default () => <button>Hello World!</button>;
```

页面上所有的 jsx/tsx 代码块，都会被 father-doc 自动转换为嵌入式 Demo，如果你确实希望展示一段 jsx/tsx 的代码块，可以使用 `pure` 修饰符，像这样：

<pre>
``` jsx | pure
不希望被转换为 Demo 的代码
```
</pre>

看起来有点儿意思了，但如果我们需要嵌入到文档中的 Demo 非常多或者非常大呢？

## 外部 Demo

当嵌入式 Demo 数量增加、或者内容变长时，将会给维护工作带来负担；而且嵌入式 Demo 无法利用编辑器的 lint、autocomplete 等利器，Demo 编写的效率会大幅下降。

所以 father-doc 提供了从 `.md` 文件中引入外部 Demo 语法，我们可以通过 `code` 标签引入一个外部 Demo：

```
<code src="./HelloButton.tsx" />
```

它也能如上面的 Demo 一样被插入进文档中进行展示：

``` jsx
export default () => <button>Hello World!</button>;
```

恭喜你，已经掌握了使用 father-doc 的核心技巧，更多使用方法请参阅 <a href="#/config">配置项</a>。
