---
title: SEO 支持
---

# SEO 支持

默认情况下，dumi 站点生成单页应用（SPA），对有 SEO 有强需求的场景，可以开启 `ssr` 和 `exportStatic` 配置，如下：

```js
// config/config.ts 或 .umirc.ts
export default {
  ssr: {},
  exportStatic: {},
}
```

这样生成的站点，对 SEO 支持会更加友好

<img src="https://user-images.githubusercontent.com/13595509/80310631-52e6d280-880e-11ea-9a9a-0942c0e24658.png" width="600" style="box-shadow:rgba(0, 0, 0, 0.15) 0px 3px 6px 0px">

> 建议开启，这样开发出来的组件库天然支持[服务端渲染](https://umijs.org/docs/ssr)
