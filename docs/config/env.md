---
toc: content
group: 框架配置
---

# 环境变量配置

<embed src="../.upstream/env-config.md"></embed>

### DUMI_CACHE

默认会将框架的高消耗执行结果（例如编译 Markdown 文件）持久化存储到本地，该结果会在二次执行时被选择性复用以提升框架运行速度，设置为 `none` 时可以禁用该行为，通常用于开发自定义 Markdown 插件的调试环节。

### DUMI_THEME

指定主题包路径，优先级高于项目 `package.json` 中声明的 `dumi-theme-xx` 主题包依赖；该路径下存在主题包 `package.json` 和 `dist` 产物，通常用于 dumi 插件强制指定主题包或基于 dumi 二次开发的场景，非前述场景不建议使用。

```bash
$ DUMI_THEME=./path/to/theme1 dumi dev
```
