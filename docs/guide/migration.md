---
legacy: /migration
---

# Migrate from father-doc

<Alert>Attention, The `father-doc` here is not the part of `father doc` in the original `father` tools. This manual is only applicable to the migration of `father-doc`</Alert>

Father-doc is the predecessor of dumi. The first alpha version was released on October 23, 2019. Thanks to the partners who used to use and contributed to father-doc. Now father-doc has been officially renamed to dumi and has done a lot of uncompatible changes, we sincerely invite everyone to migrate. It only takes 3 minutes to get it done.

## Configuration changed

All configurations have been moved from the original `config.doc` to the `config`, which means they are all to the outermost, and some configurations have also been renamed. The detailed changes are as follows:

### Change comparison table

| **New configuration name**     | **Old configuration name** | **effect**                                                            |
| ------------------------------ | -------------------------- | --------------------------------------------------------------------- |
| title                          | doc.title                  | Set the title of the website, the default value is `package.name`     |
| description                    | doc.desc                   | Set the description of the website, only works in doc mode for now    |
| logo                           | doc.logo                   | Set the logo of the website                                           |
| mode                           | doc.mode                   | Set the mode of site                                                  |
| locales                        | doc.locales                | Set the locales of the website                                        |
| menus                          | doc.menus                  | Set the sidebar menus of the website                                  |
| navs                           | doc.navs                   | Set the navigations of the website                                    |
| resolve.includes               | doc.include                | Set the detected directory of the website                             |
| resolve.previewLangs           | doc.previewLangs           | Set which code block will be rendered as React Component              |

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