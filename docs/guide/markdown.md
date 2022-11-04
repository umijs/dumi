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
