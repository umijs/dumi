---
nav: 指南
group: 基础
order: 3
---

# 约定式路由

dumi 对 Markdown 文档的目录解析做了以下拆分：默认情况下，docs 目录下的 Markdown 文档会根据目录结构解析为路由。src 目录下第一层级的 Markdown 文档会被解析为 components 下的路由，我们可以通过配置项 `resolve.atomDirs` 对分组进行更改

举几个例子方便理解：

| 磁盘路径 | 解析结果 |
| --- | --- |
| /path/to/docs/hello.md | - 分组：无<br>- 页面路由：/hello |
| /path/to/docs/hello/index.md |  - 分组：无<br>- 页面路由：/hello |
| /path/to/docs/hello/world/dumi.md | - 分组：/hello/world<br>- 页面路由：/hello/world/dumi |
| /path/to/src/hello.md | - 分组：/components<br>- 页面路由：/components/hello |
| /path/to/src/hello/index.md | - 分组：/components<br>- 页面路由：/components/hello |
| /path/to/src/hello/world.md | 不识别 |

### 自定义导航、分组和标题

如果希望控制导航/分组/页面标题的生成，可以通过**在 Markdown 文件顶部**编写 FrontMatter 实现：

```md
---
title: 自定义页面名称
nav:
  title: 自定义导航名称
  order: 控制导航顺序，数字越小越靠前，默认以路径长度和字典序排序
group:
  title: 自定义分组名称
  order: 控制分组顺序，数字越小越靠前，默认以路径长度和字典序排序
---

<!-- 其他 Markdown 内容 -->
```