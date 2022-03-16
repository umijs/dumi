---
title: Config
order: 1
toc: menu
nav:
  title: Config
  order: 3
---

# Config

Create a `.umirc.ts` or `config/config.ts` file in the project root directory to configure dumi:

```ts
// Configuration content
export default {
  // Configuration items
};
```

Currently dumi supports the following configuration items.

## Basic Config

### algolia

- Type: `Object`
- Default: `null`
- Details:

Configure Algolia's [DocSearch](https://docsearch.algolia.com/) service, usually you will need to enable the automatic generation of sitemap.xml in order to access Algolia smoothly, refer to [Configuration Item - sitemap](#sitemap).

Example：

```js
{
  algolia: {
    apiKey: 'Your api key',
    indexName: 'dumi',
  }
}
```

If your site doesn't meet DocSearch [free condition](https://docsearch.algolia.com/docs/who-can-apply), you can sign up your own Algolia account then [deploy the crawler](https://docsearch.algolia.com/docs/run-your-own). `appId` is requried in this way.

```js
{
  algolia: {
    appId: 'yourappid',
    apiKey: 'yourapikey',
    indexName: 'dumi',
  }
}
```

### apiParser

- Type: `Object`
- Default: `{}`
- Details:

Configure API parser, support the following options:

```js
{
  apiParser: {
    // configure property filter, also can be a function, see: https://github.com/styleguidist/react-docgen-typescript/#propfilter
    propFilter: {
      // skip props which was parsed from node_modules, default to false
      skipNodeModules: false,
      // skip specific properties, default to []
      skipPropsWithName: ['title'],
      // skip props which was not be explained via JSDoc, default to false
      skipPropsWithoutDoc: false,
    },
  }
}
```
### description

- Type: `String`
- Default: `null`
- Details:

The introduction of the configuration document will be displayed under the sidebar menu title, only available in `doc` mode.

### logo

- Type: `String`
- Default: The LOGO of Umi
- Details:

To set the LOGO of the document.

> If you are using a local image, such as `/public/images/xxx.png`, then configure `/images/xx.png` to import it.

### locales

- Type: `Array<[String, String]>`
- Default: `[['en-US', 'English'], ['zh-CN', '中文']]`
- Details:

The configuration is a two-dimensional array, and the first configuration will be the default locale of the site.

Each configuration is an array of length 2. The first value of the array represents the name of the locale, which will be used for splicing routing prefixes and detecting which locale the file name belongs to. The second value represents the label of the locale, which will be used Display options when switching languages.

The file name suffix of the default locale is optional. For example, in the default configuration, `index.md` and `index.en-US.md` are equivalent.

### mode

- Type: `doc | site`
- Default: `doc`
- Details:

It's used to set the document display mode. The default is document mode. When it is configured as `site`, it can be seamlessly switched to site mode. If you want to display the text and order of the navigation menu items, please refer to the `nav` configuration item in the frontmatter configuration

The effects of the two modes are as follows, document mode:

![](https://gw.alipayobjects.com/zos/bmw-prod/86ddc125-75e0-49e0-920b-f9497e806cf1/k7iyfr0t_w2600_h1754.png)

Site mode:

![](https://gw.alipayobjects.com/zos/bmw-prod/7ce6770d-df19-48fa-853e-64cbbf41b762/k7iyfarw_w2600_h1754.png)

### menus

- Type: `Object`
- Default: `Auto-generated menu`
- Details:

This configuration item is used to customize the display of the side menu, currently only available in the `site` mode, divided into multi-language mode and single-language mode, usage:

```ts
// config/config.ts or .umirc.ts
export default {
  menus: {
    // Need to customize the path of the side menu, the path without configuration will still use the automatically generated configuration
    '/guide': [
      {
        title: 'Menu item',
        path: 'Menu routing (optional)',
        children: [
          // Menu item (optional)
          'guide/index.md', // The corresponding Markdown file, the path is recognized relative to the resolve.includes directory
        ],
      },
    ],
    // If the path has other languages, you need to add the language prefix in front, which must be consistent with the path in the locales configuration
    '/zh-CN/guide': [
      // Omit, the same as above
    ],
  },
};
```

### navs

- Type: `Object | Array`
- Default: `Auto-generated navigation`
- Details:

This configuration item is used to customize the display of the navigation bar. It is only available in the `site` mode, divided into multi-language mode and single-language mode. How to use it:

```ts
// config/config.ts or .umirc.ts
export default {
  // Single language configuration is as follows
  navs: [
    null, // A null value means to retain the conventionally generated navigation and only do incremental configuration
    {
      title: 'GitHub',
      path: 'https://github.com/umijs/dumi',
    },
    {
      title: 'I have secondary navigation',
      path: 'Link optional',
      // The two-level navigation menu can be nested in the following form. Currently, more levels of nesting are not supported:
      children: [
        { title: 'First item', path: 'https://d.umijs.org' },
        { title: 'Second item', path: '/guide' },
      ],
    },
  ],

  // Multi-language configuration is as follows
  navs: {
    // The multi-language key value must be consistent with the key in the locales configuration
    'en-US': [
      null, // A null value means to retain the conventionally generated navigation and only do incremental configuration
      {
        title: 'GitHub',
        path: 'https://github.com/umijs/dumi',
      },
    ],
    'zh-CN': [
      null, // A null value means to retain the conventionally generated navigation and only do incremental configuration
      {
        title: 'GitHub',
        path: 'https://github.com/umijs/dumi',
      },
    ],
  },
};
```

### resolve

`resolve` is an `Object` type, used to configure dumi's resolution behavior, including the following configuration:

#### resolve.includes

- Type: `Array<String>`
- Default: `['docs', 'src']` or `['docs', 'packages/pkg/src']`
- Details:

Configure the document directory for dumi sniffing. Dumi will try to recursively find markdown files in the configured directory. The default values are the `docs` directory and the `src` directory (common projects). If the environment is the lerna project, the `src` directory will change It is the `packages/pkg/src` directory, and usually does not need to be configured, unless the automatic sniffing appears 『injuryed』.

#### resolve.excludes

- Type：`Array<String>`
- Default：`[]`
- Details：

The directories or files that need to be excluded. The rules are the same as the configuration of `gitignore`.

#### resolve.previewLangs

- Type: `Array<String>`
- Default: `['jsx', 'tsx']`
- Details:

The configuration dumi will be converted to the code block rendered by the ReactComponent component by default. If you don't want to do any conversion, such as a pure site like Umi's official website, then set this item to an empty array.

#### resolve.passivePreview

- Type：`Boolean`
- Default：`false`
- Details：

Passive preview mode. Only codeblocks belonging to `resolve.previewLangs` and having the `preview` modifier are rendered as ReactComponent. Generally used to render only a few code blocks in `resolve.previewLangs`, but not all of them.

### sitemap

- Type: `{ hostname: string, excludes?: string[] }`
- Default: `null`

Enable the automatic generation feature of `sitemap.xml`. The `hostname` configuration item is used to specify the domain name prefix of the URL, and the `excludes` configuration item is used to ignore certain routes that do not need to be included in the sitemap.

### title

- Type: `String`
- Default: `{package.name}`
- Details:

Configure the name of the document on the navigation bar or sidebar.

### themeConfig

- Type: `Object`
- Default: `{}`
- Details:

It's used to configure the theme package currently used. The specific configuration items depend on which configuration the theme package provides. You can visit [Theme list](/theme) to view the currently available themes.

## More Config

<!-- The followings are Umi configuration items, which are synchronized and filtered from Umi repository by scripts/sync-from-umi.js -->

<embed src="../.upstream/config.md"></embed>
