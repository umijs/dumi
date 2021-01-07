---
title: 更多配置
order: 2
toc: menu
---

# 更多配置

因为 dumi 本体是一个 Umi 的 preset——@umijs/preset-dumi，那也就是说 Umi 的配置项在 dumi 中同样有效。和基础配置一样，只需要在项目根目录创建 `.umirc.ts` 或 `config/config.ts` 文件，就可对 dumi 进行配置：

```ts
// 配置文件
export default {
  // 具体配置项
};
```

目前 dumi 支持以下 Umi 的配置项。

<!-- 以下是 Umi 配置项，由 scripts/sync-from-umi.js 从 Umi 仓库同步及过滤 -->

<embed src="../.upstream/config.md"></embed>
