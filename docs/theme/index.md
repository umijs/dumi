---
title: Theme list
order: 1
toc: menu
nav:
  title: Theme
  order: 2
---

## `dumi-theme-default`

- **Code address:** [dumi/packages/theme-default](https://github.com/umijs/dumi/tree/master/packages/theme-default)
- **Experience address:** [dumi official website](https://d.umijs.org)
- **Theme introduction:** Built-in themes of dumi

## `dumi-theme-mobile`

- **Code address:** [dumi/packages/theme-mobile](https://github.com/umijs/dumi/tree/master/packages/theme-mobile)
- **Experience address:** (Missing)
- **Theme introduction:** The mobile terminal research and development theme based on the dumi default theme extension It will have the following characteristics:
  1. Sticky mobile phone simulation container + iframe preview demo
  2. Based on [umi-hd](https://github.com/umijs/umi-hd) provide automatic settings of `viewport` and root `font-size` for demo preview
  3. Provide QR code for real machine preview

<img style="border: 1px solid #eee;" src="https://gw.alipayobjects.com/zos/bmw-prod/acb29a94-6200-4798-82eb-190177fa841c/kezwf18r_w2556_h1396.jpeg" alt="Mobile theme preview effect" />

It should be noted that if you use the responsive scheme of rem, the rem unit should also be used in the style source code.

It is recommended to refer to the antd-mobile scheme and set the Less variable as [the basic unit](https://github.com/ant-design/ant-design-mobile/blob/next/packages/antd-mobile-styles/src/base/variables.less#L4), and then as needed configure [HD variables at compile time](https://github.com/ant-design/ant-design-mobile/blob/next/config/config.ts#L96) control the final rendering value.

The HD solution can be switched through the `themeConfig` configuration item in the dumi configuration file, the configuration method is as follows:

```ts
// .umirc.ts
export default {
  // ...
  themeConfig: {
    carrier: 'dumi', // title text at left on status bar of device
    hd: {
      // umi-hd 750 HD solution (default value)
      [{ mode: 'vw', options: [100, 750] }],
      // Disable HD
      rules: [],
      // Switch HD schemes according to different device screen width breakpoints
      rules: [
        { maxWidth: 375, mode: 'vw', options: [100, 750] },
        { minWidth: 376, maxWidth: 750, mode: 'vw', options: [100, 1500] },
      ],
      // More rule: https://github.com/umijs/dumi/blob/master/packages/theme-mobile/src/typings/config.d.ts#L7
    }
  }
}
```

_Note: After the mobile theme enabled, we also can switch the demo previewer to default mode for some pages via `mobile: false` in Markdown frontmatter area:_

```md
---
mobile: false
---

Markdown content
```


## Vacant

If you have created a good dumi theme and want to share it with everyone.

Please send your theme information through Pull Request [to this document](https://github.com/umijs/dumi/edit/master/docs/theme/index.md).
