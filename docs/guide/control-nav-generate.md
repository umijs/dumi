# Control navigation generate

<Alert>
Attention：only works in <code>site</code> mode for now 
</Alert>

## The rules of convention navigation

Like menu items and menu groups, dumi navigation is based on the routing structure. The nested relationship of routes will be resolved by dumi into navigation and menu groups in navigation. Then, let's see how dumi identifies the routing structure:

```bash
/                       # index page
/guide                  # Guide page + index page of Guide page
/guide/help             # Guide page + Help page of Guide page
/other                  # Other page
/very/very/deep/child   # Very page + Very/deep group of Very page
```

Then the recognition result will be presented like:

```bash
# Navigation
LOGO     Guide | Other | Very
-----------------------------

# Side menu of Guide page
-----
Guide
-----
Help
-----

# Side menu of Other page
-----
Other
-----

# Side menu of Very page
-----
Very/deep
-----
  Child
-----
```

In a conclusion: **the first level nesting of the folder will be used as the navigation, from the second level to the last but one will be used as the side menu, and the last level will be used as the page; All the menus and pages under the first level will be grouped in the navigation**.

However, it's often not enough to rely on automatic rules. We usually have requirements about customizing navigation header text and order:

### Navigation title

The default rule of generating navigation title is to take the route name of current navigation, remove `/` and capitalize it. For example, if the route is `/guide`, dumi will take `guide` and capitalize it to `Guide`.

If you want to control the navigation title in manual way, you can configure it through [`nav.title`](/config/frontmatter#navtitle). **Attention, you only need to configure it in any markdown file in the same folder, it will take effect all**

### Navigation path

The default rule of generating navigation path is to take the first level nesting of routes. For example, if the route is `/very/very/deep/child`, then `very` will be used as the navigation path.

If you want to control the navigation path in manual way, you can configure it through [`nav.path`](/config/frontmatter#navpath).

It's different from `nav.title`, `nav.path` is a unique identifier. Because of it, manual control needs each markdown file to be set even these files in the same folder. Therefore, it is generally recommended to organize navigation by folder instead of manual control.

### Navigation order

The default rule of navigation order is: firstly, compare the length of `path`, for example `/guide` must be in front of `/guide/help`, and then compare the ASCII of navigation name, for example, `Guide` must be in front of `Help`.

If you want to control the navigation order in manual way, you can configure it through [`nav.order`](/config/frontmatter#navorder). The smaller the number, the more previous the rank will be. As same as `nav.title`, you only need to configure it in any markdown file in the same folder, it will take effect all.

### Menu generation

Please refer to [Control menu generate](/guide/control-menu-generate), **it should be noticed that in the `site` mode, since navigation is the first level of nesting, the automatic parsing of menus starts from the second level of nesting**.

## Configurate navigation

In most scenarios, we need to customize the content presented on the navigation, such as adding repo links to GitHub or links to old versions of documents or etc. We can configure it through [`navs`](/config#navs):

```ts
// config/config.ts or .umirc.ts
export default {
  // The configuration of single language is as follows
  navs: [
    null, // The null means dumi should reserve the convention navigation and only make an incremental configuration
    {
      title: 'GitHub',
      path: 'https://github.com/umijs/dumi',
    },
  ],

  // The configuration of multiple languages is as follows
  navs: {
    //The multi-languages key should be consistent with the key in the locales configuration
    'en-US': [
      null, // The null means dumi should reserve the convention navigation and only make an incremental configuration
      {
        title: 'GitHub',
        path: 'https://github.com/umijs/dumi',
      },
    ],
    'zh-CN': [
      null, // The null means dumi should reserve the convention navigation and only make an incremental configuration
      {
        title: 'GitHub',
        path: 'https://github.com/umijs/dumi',
      },
    ],
  },
};
```

However, this configuration is only used for the presentation of custom navigation header, and **does not affect the generation of routes**. If you want to customize the routing path, please configurate it in Markdown throught frontmatter configuration refered [above](#navigation-path).
