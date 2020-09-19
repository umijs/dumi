# Modes

For now, dumi supports two modes: document mode and site mode. It's very simple to switch between the two modes

```ts
// config/config.ts or .umirc.ts
export default {
  // document mode(default)
  mode: 'doc',
  // site mode
  mode: 'site',
};
```

When the component library is light and does not need complicated documents, it can be presented in document mode; when it is perfect and needs a tutorial, it is recommended to be presented in site mode. Taking dumi's official website as an example, the display effects are as follows:

## Document mode

![](https://gw.alipayobjects.com/zos/bmw-prod/86ddc125-75e0-49e0-920b-f9497e806cf1/k7iyfr0t_w2600_h1754.png)

The characteristics of document mode are:

- No navigation
- No search input
- No customized home page
- Support to present introduction through `description` configuration
- Support to present the Github Stars number automatically through `repository` in `package.json`
- Support to present the links to `Edit this doc on GitHub` in the `footer` of `markdown` file automatically through `repository` in `package.json`
- Support to change the branch of this link ,`Edit this doc on GitHub`,through `repository.branch` in `package.json`,the default is `master` branch

## Site mode

![](https://gw.alipayobjects.com/zos/bmw-prod/7ce6770d-df19-48fa-853e-64cbbf41b762/k7iyfarw_w2600_h1754.png)

The characteristics of site mode are:

- Navigation
- Search input
- Support to [config home page](/config/frontmatter#hero) through `hero` and `features`
- Support to [config footer](/config/frontmatter#footer) through `footer`
