---
nav: 配置项
group: 框架配置
toc: content
mobile: false
---

# 编译时配置

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

- 类型：`{ type: string; subType?: string; dir: string }[]`
- 默认值：`[{ type: 'component', dir: 'src' }]`

配置原子资产（例如组件、函数、工具等）Markdown 的解析目录。

其中 `type` 用于指定资产类别，必须是 URL 友好的**单数单词**，比如 `component` 或者 `hook`；`subType` 用于指定资产的子类别，通常在需要生成二级导航时使用，值必须为 URL 友好的单词；`dir` 指定目录下**第一层级**的 Markdown 文档会被解析为该实体分类下的路由，嵌套层级将不会识别。比如在默认配置下，`src/Foo/index.md` 将被解析为 `components/foo` 的路由，`type` 配置值将**自动被复数化**后作为路由的前缀路径。

单独将资产的解析逻辑拆分是为了解决 dumi 1 中普通文档与源码目录下的组件文档混淆不清、分组困难的问题。

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

#### entryFile

- 类型：`string`
- 默认值：`undefined`

指定项目的入口文件，比如 `./src/index.ts`，目前该配置会用于 API 解析，可参考[指南 - 自动 API 表格](../guide/auto-api-table.md)。

#### forceKebabCaseRouting

- 类型：`boolean`
- 默认值：`true`

配置强制 kebab-case 路由模式，即所有路径都会被转换为短横线模式，比如 `HelloWorld` 将会被转换为 `hello-world`，该配置默认开启，配置为 `false` 时将以实际文件路径为准。

### apiParser

- 类型：`{ unpkgHost?: 'https://unpkg.com'; resolveFilter?: (args: { id: string; ids: string; type: 'COMPONENT' | 'FUNCTION' }) => boolean }`
- 默认值：`undefined`

启用 API 自动解析功能，开启后可使用 `API` 全局组件，参考[指南 - 自动 API 表格](../guide/auto-api-table.md)。

其中 `unpkgHost` 配置项用于自定义 unpkg.com 的地址以加快访问速度，比如自己的私有镜像地址。解析过程中如果存在找不到的依赖，会兜底到 `unpkgHost` 的地址去找。

`resolveFilter` 配置项用于跳过指定原子资产的解析以提升性能。部分组件属性或函数签名存在多层嵌套，甚至是循环引用时，会导致解析结果巨大，此时可以通过该配置项跳过解析。

### autoAlias

- 类型：`boolean`
- 默认值：`true`

是否自动 alias 项目包名到 src 目录，如果是 father 4 项目，还会根据配置自动 alias 产物目录到源码目录，默认开启。

### locales

- 类型：`{ id: string, name: string, base?: string }[]`
- 默认值：`[{ id: 'zh-CN', name: '中文' }]`

配置站点的多语言，各子项释义如下：

1. `id` 值会作为 dumi 识别 Markdown 文件后缀的依据，以及主题国际化文案的 `key`。例如，值为 `zh-CN` 时意味着 `index.zh-CN.md` 的文件会被归类到该语言下
2. 对于默认语言的 Markdown 文件而言，后缀是可选的。例如，在默认配置下，`index.zh-CN.md` 与 `index.md` 等价
3. `name` 值会作为页面渲染语言切换链接的文本值，当只有一种语言时，不会展示切换链接
4. 约定第一项（即 `locales[0]`）为站点默认语言，其余为其他语言，对应页面需带上 `base` 才能访问到
5. `base` 值指定该语言的基础路由，对默认语言来说默认值为 `/`，对非默认语言来说默认值为 `/${id}`，仅在希望 `id` 和 `base` 不一致时才需要配置，且**仅默认语言支持配置为 `/`**

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

### sitemap

- 类型：`{ hostname: string, exclude?: string[] }`
- 默认值：`undefined`

启用 `sitemap.xml` 自动生成功能。`hostname` 配置项用来指定 URL 的域名前缀，`exclude` 配置项用来忽略某些不需要包含在 sitemap 中的路由。

### html2sketch<Badge>2.2.0+</Badge>

- 类型：`{ scriptUrl?: string }`
- 默认值：`undefined`

启用 HTML 转 [Sketch](https://www.sketch.com/) 的功能，`scriptUrl` 配置项用于指定 html2sketch 的脚本地址，如果你不希望使用内置的 CDN 地址，可以选择自定义。

该功能会在 demo 预览器操作栏添加『拷贝到 Sketch』按钮，点击后会将当前 demo 转换为 Sketch 对象并复制到剪贴板，该功能基于 [Ant Design - html2sketch](https://github.com/ant-design/html2sketch) 项目，需要注意的是，目前必须配合 [Kitchen](https://kitchen.alipay.com/) 插件才能实现在 Sketch 中粘贴，步骤演示如下：

<img src="https://gw.alipayobjects.com/zos/bmw-prod/0b8bbca9-e642-4964-bdeb-841d2b57dd21/leibpn7e_w1024_h686.gif" width="768" />

光看演示不过瘾？不妨试试看：

```jsx
export default () => (
  <div
    style={{
      width: 100,
      height: 100,
      color: '#fff',
      lineHeight: '100px',
      textAlign: 'center',
      fontSize: 30,
      background:
        'linear-gradient(0, rgb(54, 138, 255) 0%, rgb(150, 239, 253) 100%)',
      borderRadius: '50%',
    }}
  >
    dumi
  </div>
);
```

## 主题配置项

通过 `themeConfig` 可配置传递给主题的配置项：

```ts
// .dumirc.ts
import { defineConfig } from 'dumi';

export default defineConfig({
  themeConfig: {
    // 主题配置项均放置在这一层
  },
});
```

具体可用的配置项取决于项目当前使用的主题包，dumi 的默认主题目前支持如下配置项：

<embed src="../theme/default.md#RE-/<!-- site config[^]+ site config end -->/"></embed>

## 基础配置项

<embed src="../.upstream/config.md"></embed>
