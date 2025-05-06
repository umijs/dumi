---
nav: 指南
group: 基础
order: 6
---

# Markdown 增强

## embed

dumi 对 HTML 默认的 `embed` 标签做了扩展，允许在 Markdown 文档中嵌入另一个 Markdown 文档的内容

<<< @/../docs/\_snippets/embed.md

## Badge

dumi 内置了 Badge 组件，可以为 Markdown 内容（例如标题）添加标签，例如：

<<< @/../docs/\_snippets/badge.md

会被渲染为：

<embed src="@/../docs/_snippets/badge.md"></embed>

## Container

需要在正文中以醒目的方式展示额外信息时，可以使用 Container 扩展语法，例如：

<<< @/../docs/\_snippets/container.md

将会被渲染为：

<embed src="@/../docs/_snippets/container.md"></embed>

## Line Highlighting

在代码块中，如果您想要突出显示特定的一行，可以使用行高亮功能。使用行高亮功能的语法如下：

<<< @/../docs/\_snippets/line-highlight.md

渲染为：

<embed src="@/../docs/_snippets/line-highlight.md"></embed>

**除了单行之外，你还可以指定多个单行、范围或两者：**

- 使用花括号指定单个行号，如：`{5}`, 逗号分隔指定多个行，如：`{4,7,9}`。
- 使用连字符指定一系列行，如：`{5-8}`。
- 也可以结合两种方式进行选择，如：`{4,7-13,16,23-27,40}`。

<<< @/../docs/\_snippets/multi-line-highlight.md

渲染为：

<embed src="@/../docs/_snippets/multi-line-highlight.md"></embed>

## Tree <Badge>2.2.0+</Badge>

使用 Tree 组件可以创建文件树，使用语法如下：

<<< @/../docs/\_snippets/tree.md

渲染为：

<embed src="@/../docs/_snippets/tree.md"></embed>

通过添加 `small` 元素可以为节点添加注释内容。

<<< @/../docs/\_snippets/tree-comment.md

渲染为：

<embed src="@/../docs/_snippets/tree-comment.md"></embed>

## CodeGroup <Badge>2.3.0+</Badge>

需要将多代码块合并成一个分组进行展示时，可以使用 CodeGroup 语法，例如：

<<< @/../docs/\_snippets/code-group.md

将会被渲染为：

<embed src="@/../docs/_snippets/code-group.md"></embed>
