---
title: Advanced Config
order: 2
toc: menu
---

# Advanced Config

Because dumi actually is a preset of Umi —— @umijs/preset-dumi, which means the configurations of Umi will work in dumi too. Same as basic configurations, you just create a `.umirc.ts` or `config/config.ts` file in the project root directory to configure dumi:

```ts
// Configuration content
export default {
  // Configuration items
};
```

Currently dumi supports the following configuration items from Umi.

<!-- The followings are Umi configuration items, which are synchronized and filtered from Umi repository by scripts/sync-from-umi.js -->
<embed src="../.upstream/config.md"></embed>
