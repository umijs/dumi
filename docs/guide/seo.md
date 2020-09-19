---
title: SEO
---

# SEO

Dumi generates a single page application (SPA) in default. For some scenarios with strong SEO requirements, you can enable the `ssr` and `exportStatic` configuration, as follows:

```js
// config/config.ts or .umirc.ts
export default {
  ssr: {},
  exportStatic: {},
};
```

The generated site will be more friendly to SEO

<img src="https://user-images.githubusercontent.com/13595509/80310631-52e6d280-880e-11ea-9a9a-0942c0e24658.png" width="600" style="box-shadow:rgba(0, 0, 0, 0.15) 0px 3px 6px 0px">

> It is recommended to turn it on, because the developed component library naturally supports to [SSR](https://umijs.org/docs/ssr)
