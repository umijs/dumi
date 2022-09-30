---
nav: 配置项
---

# 框架配置

dumi 2 基于 Umi 4，除了自身特有的配置项以外，也支持 Umi 4 的配置项，两者均在 `.umirc.ts` 或 `config/config.ts` 中配置。

```ts
// .umirc.ts or config/config.ts
import { defineConfig } from 'dumi';

export default defineConfig({
  ...
});
```

## dumi 配置项

### resolve

用于配置 Markdown 解析相关的行为，包含如下子项。

#### docDirs

- 类型：`string[]`
- 默认值：`['docs']`

配置 Markdown 文档的解析目录，路径下的 Markdown 文档会根据目录结构解析为路由。

#### entityDirs

- 类型：`{ type: string; dir: string }[]`
- 默认值：`[{ type: 'components', dir: 'src' }]`

配置 Markdown 实体（例如组件、函数、工具等）的解析目录，该目录下 **第一层级** 的 Markdown 文档会被解析为该实体分类下的路由，嵌套层级将不会识别。比如在默认配置下，`src/Foo/index.md` 将被解析为 `components/foo` 的路由。

设计实体的概念是为了解决 dumi 1 中普通文档与源码目录下的组件文档混淆不清、分组困难的问题。

#### codeBlockMode

- 类型：`'active' | 'passive'`
- 默认值：`'active'`

### locales

- 类型：`{ id: string, name: string, base?: string }[]`
- 默认值：`[{ id: 'zh-CN', name: '中文' }]`

配置站点的多语言，各子项释义如下：

1. `id` 值会作为 dumi 识别 Markdown 文件后缀的依据，以及主题国际化文案的 `key`。例如，值为 `zh-CN` 时意味着 `index.zh-CN.md` 的文件会被归类到该语言下
2. 对于默认语言的 Markdown 文件而言，后缀是可选的。例如，在默认配置下，`index.zh-CN.md` 与 `index.md` 等价
3. `name` 值会作为页面渲染语言切换链接的文本值，当只有一种语言时，不会展示切换链接
4. `base` 值指定该雨燕的基础路由，对默认语言来说默认值为 `/`，对非默认雨语言来说默认值为 `/${id}`，仅在希望 `id` 和 `base` 不一致时才需要配置

### extraRemarkPlugins

- 类型：`(string | function | [string, object] | [function, object])[]`
- 默认值：`[]`

配置额外的 [remark](https://remark.js.org/) 插件，用于处理 Markdown 语法树的编译。数组项的值可以是：

1. 插件名称或路径
2. 插件函数
3. 传递数组时，第一项为插件名称/路径/函数，第二项为插件配置

### extraRehypePlugins

- 类型：`(string | function | [string, object] | [function, object])[]`
- 默认值：`[]`

配置额外的 [rehype](https://github.com/rehypejs/rehype) 插件，用于处理 HTML 语法树的编译。数组项的值可以是：

1. 插件名称或路径
2. 插件函数
3. 传递数组时，第一项为插件名称/路径/函数，第二项为插件配置

### themeConfig

配置传递给主题的配置项，具体包含哪些配置取决于主题实现。默认主题目前支持如下配置项：

```ts
{
  themeConfig: {
    name: '站点名称（可选）';
    logo: '站点 LOGO 地址';
    nav: [{ title: '导航标题', link: '导航路由' }]; // 可选，未配置时走约定式导航
    sidebar: { // 可选，未配置时走约定式菜单
      '/guide': [
        {
          title: '侧边菜单分组名称（可选）',
          children: [
            { title: '菜单项标题', link: '菜单项路由' }
          ]
        }
      ]
    };
  }
}
```

## Umi 配置项

参考 Umi 4 的文档：https://umijs.org/docs/api/config
