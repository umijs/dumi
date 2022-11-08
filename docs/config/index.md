---
nav: 配置项
toc: content
---

# 框架配置

dumi 2 基于 Umi 4，除了自身特有的配置项以外，同样也支持 Umi 4 提供的基础配置项，两者均在 `.dumirc.ts` 中配置。

```ts
// .dumirc.ts
import { defineConfig } from 'dumi';

export default defineConfig({
  ...
});
```

## 重点配置项

### resolve

用于配置 Markdown 解析相关的行为，包含如下子项。

#### docDirs

- 类型：`string[]`
- 默认值：`['docs']`

配置 Markdown 文档的解析目录，路径下的 Markdown 文档会根据目录结构解析为路由。

#### atomDirs

- 类型：`{ type: string; dir: string }[]`
- 默认值：`[{ type: 'component', dir: 'src' }]`

配置原子资产（例如组件、函数、工具等）Markdown 的解析目录，该目录下 **第一层级** 的 Markdown 文档会被解析为该实体分类下的路由，嵌套层级将不会识别。比如在默认配置下，`src/Foo/index.md` 将被解析为 `components/foo` 的路由。

单独将资产的解析逻辑拆分是为了解决 dumi 1 中普通文档与源码目录下的组件文档混淆不清、分组困难的问题。

是否自动 alias 项目包名到 src 目录，如果是 father 4 项目，还会根据配置自动 alias 产物目录到源码目录，默认开启。

#### codeBlockMode

- 类型：`'active' | 'passive'`
- 默认值：`'active'`

配置代码块的解析模式。dumi 默认会编译有关联技术栈的代码块（比如内置的 React 技术栈会编译 jsx、tsx 代码块）、将其处理为组件，不需要编译的代码块需要添加 `| pure` 修饰符才能跳过编译；倘若你希望将这个行为反过来，可以将其配置为 `passive`。

两者在使用上的区别如下：

<pre><code class="language-markdown">
active 模式：

```jsx
export default () => '我会被编译，展示为组件';
```

```jsx | pure
export default () => '我不会被编译，仍然展示为源代码';
```

passive 模式：

```jsx
export default () => '我不会被编译，仍然展示为源代码';
```

```jsx | demo
export default () => '我会被编译，展示为组件';
```
</code></pre>

### autoAlias

- 类型：`boolean`
- 默认值：`true`

### locales

- 类型：`{ id: string, name: string, base?: string }[]`
- 默认值：`[{ id: 'zh-CN', name: '中文' }]`

配置站点的多语言，各子项释义如下：

1. `id` 值会作为 dumi 识别 Markdown 文件后缀的依据，以及主题国际化文案的 `key`。例如，值为 `zh-CN` 时意味着 `index.zh-CN.md` 的文件会被归类到该语言下
2. 对于默认语言的 Markdown 文件而言，后缀是可选的。例如，在默认配置下，`index.zh-CN.md` 与 `index.md` 等价
3. `name` 值会作为页面渲染语言切换链接的文本值，当只有一种语言时，不会展示切换链接
4. `base` 值指定该语言的基础路由，对默认语言来说默认值为 `/`，对非默认语言来说默认值为 `/${id}`，仅在希望 `id` 和 `base` 不一致时才需要配置

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
    name: '站点名称（可选）',
    logo: '站点 LOGO 地址',
    nav: [{ title: '导航标题', link: '导航路由' }], // 可选，未配置时走约定式导航
    sidebar: { // 可选，未配置时走约定式菜单
      '/guide': [
        {
          title: '侧边菜单分组名称（可选）',
          children: [
            { title: '菜单项标题', link: '菜单项路由' }
          ]
        }
      ]
    },
    footer: '页脚 HTML', // 有 `Powered by dumi` 的默认值，可自定义，配置为 false 时不展示
  }
}
```

### analytics

- 类型：`{ ga_v2?: string; baidu?: string; ga?: string }`
- 默认值：`undefined`

dumi 内置了站点统计的功能，目前支持 [Google Analytics](https://analytics.google.com/analytics/web/) 和[百度统计](https://tongji.baidu.com/web/welcome/login)。

示例：

```ts
{
  analytics: {
    // google analytics 的 key (GA 4)
    ga_v2: 'G-abcdefg',
    // 若你在使用 GA v1 旧版本，请使用 `ga` 来配置
    ga: 'ga_old_key'

    // 百度统计的 key
    baidu: 'baidu_tongji_key',
  }
}
```

## 基础配置项

<embed src="../.upstream/config.md"></embed>
