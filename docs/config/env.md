# 环境变量配置

<embed src="../.upstream/env-config.md"></embed>

### DUMI_CACHE

默认会将框架的高消耗执行结果（例如编译 Markdown 文件）持久化存储到本地，该结果会在二次执行时被选择性复用以提升框架运行速度，设置为 `none` 时可以禁用该行为，通常用于开发自定义 Markdown 插件的调试环节。
