---
title: Config
order: 1
group:
  title: 配置项
---

# Config

father-doc 基于 Umi，配置的方式与 Umi 项目一致，使用 `.umirc.js` 或 `config/config.js` 都可进行配置，内容大致如下：

```js
// 配置文件内容
export default {
  // Umi 配置
  doc: {
    // father-doc 独有配置
  },
};
```

## father-doc 独有配置

### doc.title

- 类型：`String`
- 默认值：`package.name`
- 详细：

配置文档的名称，通常是所开发的组件的名称，等同于配置 Umi `title` 配置中的 `defaultTitle`，该配置除用于网站标题之外，还会显示在侧边栏菜单中。

### doc.desc

- 类型：`String`
- 默认值：`null`
- 详细：

配置文档的介绍，会显示在侧边栏菜单标题的下方。

### doc.logo

- 类型：`String`
- 默认值：Umi 的 LOGO
- 详细：

配置文档的 LOGO，会显示在侧边栏菜单标题上方。

### doc.include

- 类型：`Array<String>`
- 默认值：`['docs']`
- 详细：

配置默认会嗅探的除 `src` 目录以外的目录，该目录下的 `.md` 文件也会被加入进路由，而且优先级高于 `src` 目录。

### doc.footer

- 类型：

```tsx | pure
type footer = {
  links?:
    | false
    | {
        key?: string;
        title: React.ReactNode;
        href: string;
        blankTarget?: boolean;
      }[];
  copyright?: React.ReactNode;
};
```

- 默认值：`{ copyright: '❤️ Powered By Father' }`
- 详细：

  配置文档的页脚，设置为 `{}` 即可不显示页脚。

## Umi 的配置

### routes

- 类型：`Array`
- 默认值：`null`
- 详细：

<Alert>注意：暂不支持配置嵌套路由</Alert>

配置式路由，配置方式与 Umi 一致，可通过 `meta` 属性传递支持的 <a href="#/config/frontmatter">FrontMatter</a> 属性。

### 其他配置

详见 Umi 的 [官方文档](https://umijs.org/config)。
