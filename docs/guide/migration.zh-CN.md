---
legacy: /migration
---

# 从 father-doc 迁移

<Alert>注意，此处的 `father-doc` 并非原有 `father` 工具集中的 `father doc` 部分，本手册仅适用于 `father-doc` 的迁移</Alert>

father-doc 是 dumi 的前身，在 2019 年 10 月 23 日发出了第一个 alpha 版本，感谢曾经使用和贡献 father-doc 的伙伴们，如今 father-doc 已正式更名为 dumi，且做了很多不兼容的变更，真诚邀请大家进行迁移，只需要 3 分钟即可快速搞定。

## 配置项变更

所有配置项都从原有的 `config.doc` 层级提升到了 `config` 层级，即全部到最外层了，部分配置项也做了更名，详细变化如下：

### 变更对照表

| **新配置项名称**     | **原配置项名称** | **作用**                                        |
| -------------------- | ---------------- | ----------------------------------------------- |
| title                | doc.title        | 设置网站的标题，默认值为 `package.name`         |
| description          | doc.desc         | 设置网站的介绍文字，目前仅 doc 模式下有用       |
| logo                 | doc.logo         | 设置网站的 LOGO                                 |
| mode                 | doc.mode         | 设置网站的类型                                  |
| locales              | doc.locales      | 设置网站的多语言配置                            |
| menus                | doc.menus        | 配置网站的侧边栏菜单                            |
| navs                 | doc.navs         | 配置网站的导航菜单                              |
| resolve.includes     | doc.include      | 设置文档的探测目录                              |
| resolve.previewLangs | doc.previewLangs | 设置哪些代码块语言会被当做 React Component 渲染 |

### API 改名

需要注意的是，上述有两个 API 除了提升层级外，还做了改名，分别是：

- `desc` 修改为 `description`：不用缩写
- `include` 修改为 `includes`：修正单复数

## FrontMatter 变更

对于 Markdown 文件的 FrontMatter 配置，dumi 也做了修改，详细情况如下：

### `order` 的排序规则反向

`order` 的排序规则由越大越靠前修改为**越小越靠前**。

一开始路由、菜单和导航的 `order` 规则都是 `order` 值越大越靠前，但大家实际使用下来很不方便，随着页面的增多经常需要把第一篇文档的 `order` 值再改大一些，所以做了反序。

### 废弃 `slugs` 改用 `toc`

此前 father-doc 用 `slugs: false` 来关闭右侧的锚点菜单展示，在 dumi 中，改用 `toc` 配置项来控制，且存在 3 种值：`false` 关闭、`menu` 集成到右侧菜单、`content` 展示在内容区域（默认值）。

### `sidebar` 改为 `sidemenu`

修正语义，我们这个场景确实是 `sidemenu`。

### `hero.text` 改为 `hero.title`

修正语义，首页 HERO 区域应为 `title`。

## 其他杂项

### `gitignore`

由于 Umi 3 的临时文件目录从 `pages` 文件夹提升到了根目录，所以如果原有 `gitignore` 中存在 `pages/.umi`，需要修改为 `.umi`。
