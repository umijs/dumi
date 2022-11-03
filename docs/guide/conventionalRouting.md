---
group: 基础
---

# 约定式路由

举几个例子方便理解：

| 磁盘路径/模式 | doc 模式 | site 模式 |
| --- | --- | --- |
| /path/to/src/index.md | - 分组：无<br >- 页面路由：/ | - 导航：无<br >- 分组：无<br>- 页面路由：/ |
| /path/to/src/hello.md | - 分组：无<br >- 页面路由：/hello | - 导航：/hello<br >- 分组：/hello<br>- 页面路由：/hello |
| /path/to/src/hello/index.md | - 分组：/hello<br >- 页面路由：/hello | - 导航：/hello<br >- 分组：/hello<br>- 页面路由：/hello |
| /path/to/src/hello/world.md | - 分组：/hello<br >- 页面路由：/hello/world | - 导航：/hello<br >- 分组：/hello<br>- 页面路由：/hello/world |
| /path/to/src/hello/world/dumi.md | - 分组：/hello/world<br >- 页面路由：/hello/world/dumi | - 导航：/hello<br >- 分组：/hello/world<br>- 页面路由：/hello/world/dumi |

需要注意的是，**多个基础路径下相同磁盘路径的文件生成的路由会相互冲突**，这意味着在默认配置下 `docs/index.md` 和 `src/index.md` 只有其中 1 个会被识别。

### 自定义导航、分组和标题

如果希望控制导航/分组/页面标题的生成，可以通过**在 Markdown 文件顶部**编写 FrontMatter 实现：

```markdown
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