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
