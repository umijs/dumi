# 控制导航生成

<Alert>
注意：导航仅在 <code>site</code> 模式下可用。
</Alert>

## 约定式导航规则

和菜单项及菜单分组一样，dumi 的导航也是建立在路由结构上生成的。路由的嵌套关系会被 dumi 解析为导航及导航下的菜单分组，还是看看 dumi 会怎么识别路由结构：

```bash
/                       # 首页
/guide                  # 指南导航 + 指南导航的首页
/guide/help             # 指南导航 + 指南导航的帮助分组
/other                  # 其他导航
/very/very/deep/child   # very 导航 + very/deep 分组
```

然后这个识别结果会被展示为：

```bash
# 导航头
LOGO     Guide | Other | Very
-----------------------------

# 指南的侧边菜单
-----
Guide
-----
Help
-----

# 其他的侧边菜单
-----
Other
-----

# Very 的侧边菜单
-----
Very/deep
-----
  Child
-----
```

总结一下约定式生成的逻辑：**文件夹的第一级嵌套会作为导航，第二级至倒数第二级嵌套会作为侧边菜单，最后一级是页面；第一级嵌套下的所有菜单和页面会被归集到该导航下**。

但仅依靠自动规则往往是不够的，我们通常还有定制导航头文字和顺序的需要：

### 控制导航名称

导航名称的默认生成规则是，取当前导航的路由名称去掉 `/` 并首字母大写。比如，路由是 `/guide`，dumi 将会取 `guide` 并首字母大写变成 `Guide`。

如果希望手动控制导航名称，可以使用 [`nav.title`](/config/frontmatter#navtitle) 的 frontmatter 配置项进行配置；**注意，同一导航文件夹下只需要在任意 Markdown 文件中配置，则会全体生效**。

### 控制导航路径

导航路径的默认生成规则是，取路由的第一级嵌套。比如，路由是 `/very/very/deep/child`，那么 `very` 则会作为导航路径。

如果希望手动控制导航路径，可以使用 [`nav.path`](/config/frontmatter#navpath) 的 frontmatter 配置项进行配置。

不同于 `nav.title`，由于 `nav.path` 作为唯一标识符，手动控制的话即便同一文件夹下也需要每个 Markdown 文件都设置，所以通常还是建议用文件夹来组织导航而不是手动控制。

### 控制导航顺序

导航的默认排序规则为，先对比 `path` 的长度，例如 `/guide` 肯定排在 `/guide/help` 前面，其次对比导航名称的 ASCII 码，比如 `Guide` 肯定排在 `Help` 前面。

如果希望手动控制导航顺序，可以使用 [`nav.order`](/config/frontmatter#navorder) 的 frontmatter 配置项进行配置，数字越小越靠前；和 `nav.title` 一样，同一导航文件夹下只需要在任意 Markdown 文件中配置，就会全体生效。

### 控制菜单生成

请参考 [控制菜单生成](/guide/control-menu-generate)，**需要注意的是，在 `site` 模式下，由于导航作为第一级嵌套，菜单的自动解析都是从第二级嵌套开始的**。

## 配置式导航

在大部分场景下，我们都需要对导航上展示的内容做定制，例如添加 GitHub 的仓库链接、旧版文档的链接等等，可以使用 [`navs` 配置项](/config#navs) 来实现：

```ts
// config/config.ts 或 .umirc.ts
export default {
  // 单语言配置方式如下
  navs: [
    null, // null 值代表保留约定式生成的导航，只做增量配置
    {
      title: 'GitHub',
      path: 'https://github.com/umijs/dumi',
    },
  ],

  // 多语言配置方式如下
  navs: {
    // 多语言 key 值需与 locales 配置中的 key 一致
    'en-US': [
      null, // null 值代表保留约定式生成的导航，只做增量配置
      {
        title: 'GitHub',
        path: 'https://github.com/umijs/dumi',
      },
    ],
    'zh-CN': [
      null, // null 值代表保留约定式生成的导航，只做增量配置
      {
        title: 'GitHub',
        path: 'https://github.com/umijs/dumi',
      },
    ],
  },
};
```

但此配置项只用于自定义导航头的展示项，**并不会影响路由的生成**，如果希望自定义路由路径，请 [参考上方](#控制导航路径) 在 Markdown 文件中通过 frontmatter 配置项进行控制。
