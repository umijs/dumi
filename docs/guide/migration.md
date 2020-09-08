---
legacy: /migration
---

# Migrate from father-doc

<Alert>Attention, The `father-doc` here is not the part of `father doc` in the original `father` tools. This manual is only applicable to the migration of `father-doc`</Alert>

Father-doc is the predecessor of dumi. The first alpha version was released on October 23, 2019. Thanks to the partners who used to use and contributed to father-doc. Now father-doc has been officially renamed to dumi and has done a lot of uncompatible changes, we sincerely invite everyone to migrate. It only takes 3 minutes to get it done.

## Configuration changed

All configurations have been moved from the original `config.doc` to the `config`, which means they are all to the outermost, and some configurations have also been renamed. The detailed changes are as follows:

### Change comparison table

| **New configuration name**     | **Old configuration name** | **effect**                                        |
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

### API changed

It should be noticed that there are two APIs not only be moved, but also renamed, they are:

- `desc` changed to `description`：non-abbreviated
- `include` changed to `includes`：improve grammar of singular and plural

## FrontMatter Changed

For the FrontMatter configuration of Markdown files, dumi has also made changes, the details are as follows:

### `order` reverse

The sorting rule of `order` is changed from the bigger the number, the previous the rank is, to **the smaller the number, the previous the rank is**.

In the beginning, the `order` rules for routes, menus, and navigations are that the higher the `order` number, the previous the rank is, but it is very inconvenient for everyone to use it in actual project. With the number of pages increasing, we need to increase the `order` number of the first document. So it’s reversed.

### Deprecated `slugs` and use `toc` instead

Previously, father-doc used `slugs: false` to turn off the anchor menu prsented on the right. In dumi, it controlled via the `toc` configuration, and there are 3 values: `false` means off, `menu` means integrated into the menu on the right, `content` means presented in the content area (default value).

### `sidebar` changed to `sidemenu`

For correcting the semantics, our scene is `sidemenu` indeed.

### `hero.text` changed to `hero.title`

For correcting the semantics, the HERO area of the homepage should be `title`.

## Others

### `gitignore`

Since the temporary file directory of Umi 3 has been moved from the `pages` folder to the root directory, if there is `pages/.umi` in `gitignore`, it needs to be modified to `.umi`.