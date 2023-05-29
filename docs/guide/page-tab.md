---
group: 进阶
order: 1
---

# 页面 Tab

为了便于开发者更优雅地组织复杂文档，比如将 API、示例、设计规范等内容组合呈现，dumi 提供了开箱即用的约定式页面 Tab 特性，以该篇文档为例：

```bash
.
└── docs
    └── guide
        ├── page-tab.md
        └── page-tab.$tab-example.md  # Tab 示例内容
```

dumi 约定同名 Markdown 文件的 `$tab-{key}` 修饰符该文档的 Tab 内容，如上所示，`page-tab.$tab-example.md` 会作为 `page-tab.md` 的 Tab 呈现。此处 `example` 作为 Tab 的 key 值，如果需要配置 Tab 标题，可以使用 FrontMatter 来定义，用法[同普通文档](../config/markdown.md)：

```md
---
title: Tab 示例
---
```

如此一来，我们就能得到和当前页面一样的 Tab 效果。

如果你是 dumi 的主题包或插件开发者，还可以通过插件 API 来为指定路由添加 Tab，具体用法请参考 [插件 API - addContentTab](../plugin/api.md#addcontenttab)。
