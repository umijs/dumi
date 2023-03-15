---
nav: 指南
group: 基础
order: 6
---

# Markdown 增强

## embed

dumi 对 HTML 默认的 `embed` 标签做了扩展，允许在 Markdown 文档中嵌入另一个 Markdown 文档的内容

```md
<!-- 引入全量的 Markdown 文件内容 -->

<embed src="/path/to/some.md"></embed>

<!-- 根据行号引入指定行的 Markdown 文件内容 -->

<embed src="/path/to/some.md#L1"></embed>

<!-- 根据行号引入部分 Markdown 文件内容 -->

<embed src="/path/to/some.md#L1-L10"></embed>

<!-- 根据正则引入部分 Markdown 文件内容 -->

<embed src="/path/to/some.md#RE-/^[^\r\n]+/"></embed>
```

## Badge

dumi 内置了 Badge 组件，可以为 Markdown 内容（例如标题）添加标签，例如：

```md
### Info Badge <Badge>info</Badge>

### Warning Badge <Badge type="warning">warning</Badge>

### Error Badge <Badge type="error">error</Badge>

### Success Badge <Badge type="success">success</Badge>
```

会被渲染为：

### Info Badge <Badge>info</Badge>

### Warning Badge <Badge type="warning">warning</Badge>

### Error Badge <Badge type="error">error</Badge>

### Success Badge <Badge type="success">success</Badge>

## Container

需要在正文中以醒目的方式展示额外信息时，可以使用 Container 扩展语法，例如：

```md
:::info{title=自定义标题}
这是一条普通信息
:::

:::success
这是一条成功信息
:::

:::warning
这是一条警告信息
:::

:::error
这是一条错误信息
:::
```

将会被渲染为：

:::info{title=自定义标题}
这是一条普通信息
:::

:::success
这是一条成功信息
:::

:::warning
这是一条警告信息
:::

:::error
这是一条错误信息
:::

## Line Highlighting

在代码块中，如果您想要突出显示特定的一行，可以使用行高亮功能。使用行高亮功能的语法如下：

<pre lang="markdown">
```jsx {5}
import React from 'react';

export default () =&gt; (
  &lt;div&gt;
    &lt;h1&gt;Hello dumi!&lt;/h1&gt;
  &lt;/div&gt;
);
```
</pre>

渲染为：

```jsx {5}
import React from 'react';

export default () => (
  <div>
    <h1>Hello dumi!</h1>
  </div>
);
```

**除了单行之外，你还可以指定多个单行、范围或两者：**

- 使用花括号指定单个行号，如：`{5}`, 逗号分隔指定多个行，如：`{4,7,9}`。
- 使用连字符指定一系列行，如：`{5-8}`。
- 也可以结合两种方式进行选择，如：`{4,7-13,16,23-27,40}`。

<pre lang="markdown">
```yml {3,6-9,12,13}
features:
  - title: 更好的编译性能
    emoji: 🚀
  - title: 内置全文搜索
    emoji: 🔍
  - title: 全新主题系统
    emoji: 🎨
  - title: 约定式路由增强
    emoji: 🚥
  - title: 资产元数据 2.0
    emoji: 💡
  - title: 继续为组件研发而生
    emoji: 💎
```
</pre>

渲染为：

```yml {3,6-9,12,13}
features:
  - title: 更好的编译性能
    emoji: 🚀
  - title: 内置全文搜索
    emoji: 🔍
  - title: 全新主题系统
    emoji: 🎨
  - title: 约定式路由增强
    emoji: 🚥
  - title: 资产元数据 2.0
    emoji: 💡
  - title: 继续为组件研发而生
    emoji: 💎
```
