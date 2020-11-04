---
order: 1
nav:
  order: 2
  title: Config
toc: menu
---

<Alert>
Tip：dumi is based on Umi, which means not only supports the configurations mentioned on this page, but also supports <a target="_blank" href="https://umijs.org/config"> all configurations of Umi </a> and <a target="_blank" href="https://umijs.org/plugins/preset-react"> the plugins of Umi </a>
</Alert>

# Configuration

Dumi is based on Umi, and the configuration way is the same as the Umi. It can be configured in `.umirc.js` or `config/config.js`. The content is as follows:

```js
// configuration content
export default {
  // configuration items
};
```

## algolia

- Type: `Object`
- Default: `null`
- Details:

To set Algolia's [DocSearch](https://docsearch.algolia.com/) service.

For example：

```js
{
  algolia: {
    apiKey: 'yourapikey',
    indexName: 'dumi',
  }
}
```

## base

- Type: `string`
- Default: `/`
- Details:

To set the routing prefix, usually used to deploy to a non-root directory.

## description

- Type: `String`
- Default: `null`
- Details:

To set the description of the document, which will be presented below the sidebar menu, only works in `doc` mode.

## dynamicImport

- Type: `object`
- Default: `false`
- Details:

Whether to enable load-on-demand, which means whether to split the build productions, and download additional JS and execute it when needed.

More: [the Configurations of Umi - dynamicImport](https://umijs.org/config#dynamicimport);

## exportStatic

- Type: `object`
- Details:

To set the output format of html, and only output `index.html` by default.

If you enable `exportStatic`, html files will be output for each route.

More: [the Configurations of Umi - exportStatic](https://umijs.org/config#exportstatic);

## favicon

- Type: `string`
- Details:

To set the favicon address (href attribute).

For example,

```js
export default {
  favicon: '/assets/favicon.ico',
};
```

> If you want to use local images, please put them in the `public` directory

## logo

- Type: `String`
- Default: The LOGO of Umi
- Details:

To set the LOGO of the document.

> If you want to use a local image, such as `/public/images/xxx.png`, then configure `/images/xx.png` to import it.

## locales

- Type: `Array<[String, String]>`
- Default: `[['en-US', 'English'], ['zh-CN', '中文']]`
- Details:

The configuration is a two-dimensional array, and the first item of array will be the default locale of the site.

Each item of configuration is an array of length 2. The first item value of the array represents the name of the locale, which will be used to splice the routing prefix and detect the locale of the file name. The second value represents the label of the locale, which will be used presented options when switching languages.

The file name suffix of the default locale is optional. For example, in the default configuration, `index.md` and `index.en-US.md` are equivalent.

## mode

- Type: `doc | site`
- Default: `doc`
- Details:

This configuration is used to set the document presented mode. The default is document mode (left menu + right content). It can be switched to site mode (navigation header + left menu + right content) by configured it as `site`. If you want to modify the text and order of the navigation menu items, you can refer to the `nav` configurations in the frontmatter.

The effects of the two modes can be seen in [Guide - Modes](/guide/mode)。

## menus

- Type: `Object`
- Default: `automatic generated`
- Details:

This configuration is used to customize the present of the side menu. It currently only works in the `site` mode, which has multi-language mode and single-language mode. Please refer to [Guide - Configurate side menu](/guide/control-menu-generate#configurate-side-menu).

## navs

- Type: `Object | Array`
- Default: `automatic generated`
- Details:

This configuration is used to customize the present of the navigation bar. It only works in the `site` mode, which has multi-language mode and single-language mode. Please refer to [Guide - Configurate navigation](/guide/control-nav-generate#configurate-navigation).

The sub-navigation menu can be nested in the following forms, and currently does not support more levels of nesting:

```js
export default {
  navs: [
    {
      title: 'IHaveSubNavigation',
      path: 'path is optional',
      children: [
        { title: 'firstItem', path: 'https://d.umijs.org' },
        { title: 'secondItem', path: '/guide' },
      ],
    },
  ],
};
```

## resolve

`resolve` is an `Object` type with the following configuration:

### includes

- Type: `Array<String>`
- Default: `['docs', 'src']` or `['docs', 'packages/pkg/src']`
- Details:

Configure the document directory for dumi sniffing. Dumi will try to recursively find markdown files in the configured directory. The default values are the `docs` directory and the `src` directory (common projects). If it is the lerna project, the `src` directory will change to the `packages/pkg/src` directory and usually does not need to be configured, unless the automatic sniffing get『injuryed』.

### previewLangs

- Type: `Array<String>`
- Default: `['jsx', 'tsx']`
- Details:

Configure the code block that will be converted to ReactComponent by dumi. If you don't want to do any conversion such as a pure site like Umi's official website, you can set this item to an empty array.

## publicPath

- Type: `String`
- Default: `/`
- Details:

Configure the publicPath of webpack. Webpack will add the value of `publicPath` in front of the static file path when packaging. When you need to modify the static file address, like using CDN deployment, set the value of `publicPath` to the value of CDN.

## routes

- Type: `Array`
- Default: `null`
- Details:

Configuration routing, the configuration method is the same as Umi, and can set it in `meta` to pass through to [frontmatter](/config/frontmatter)

## ssr

- Type: `object`
- Default: `false`
- Details:

Configure whether to enable SSR. All routes will be pre-rendered as HTML after setting it to true, which is good for search engine crawler.

More: [the configurations of Umi - ssr](https://umijs.org/config#ssr);

## scripts

- Type: `Array`
- Default: `[]`

Same as [headScripts](https://umijs.org/config#headscripts), configure additional scripts in `<body>`.

## sitemap <Badge>1.1.0-beta.30+</Badge>

- Type: `{ hostname: string, excludes?: string[] }`
- Default: `null`

Enable auto-generate `sitemap.xml` feature. The `hostname` option for configure hostname of item url in sitemap, the `excludes` options for exclude some route paths in sitemap.

## title

- Type: `String`
- Default: `package.name`
- Details:

The name of the configuration document, generally the name of the developed component.

## theme

- Type: `Object`
- Default: `default theme`
- Details:

The theme color variable names refer to https://github.com/umijs/dumi/blob/master/packages/theme-default/src/style/variables.less

```js
  theme: {
    '@c-primary': '#ff652f',
  }
```

## targets

- Type: `object`
- Default: `{ chrome: 49, firefox: 64, safari: 10, edge: 13, ios: 10 }`

Configure minimum compatibled version of the browser, and the polyfill and syntax conversion will be automatically imported.

## Others

More: [the configurations of Umi](https://umijs.org/config)
