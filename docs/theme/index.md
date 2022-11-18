---
nav: 主题
group:
  title: 介绍
  order: -1
---

# 如何工作

当 dumi 提供的默认主题无法满足项目需要时，即可选择对 dumi 的默认主题进行局部定制或全部定制。先来看一下主题包应有的目录结构。

## 目录结构

无论是单独发布的主题包(src/_)还是项目本地主题包(.dumi/theme/_)，都应符合如下目录结构：

```bash
.
├── builtins         # 全局组件，注册的组件可直接在 Markdown 中使用
│   ├── Hello          # {Component}/index.tsx 会被识别，可在 md 里使用 <Hello></Hello>
│   │   └── index.tsx
│   └── World.tsx      # {Component}.tsx 会被识别，可在 md 里使用 <World></World>
├── locales          # 国际化文案，通过 `import { useIntl, FormattedMessage } from 'dumi'` 来调用文案，自动根据当前的 locale 切换
│   └── zh-CN.json
├── layouts          # 布局组件，会被 dumi 直接引用
│   ├── GlobalLayout   # 全局 Layout，通常用来放置 ConfigProvider
│   ├── DocLayout      # 文档 Layout，包含导航、侧边菜单、TOC 等，包裹 Markdown 正文做渲染
│   └── DemoLayout     # 组件示例 Layout，需要控制 demo 独立访问页（`/~demos/:id`）的布局时使用
├── slots            # 局部组件（具体有哪些组件取决于主题包实现，应由布局组件引用，以下仅为举例示意）
│   ├── Navbar         # 导航栏
│   ├── NavbarLogo     # 导航栏 LOGO 区域
│   ├── SideMenu       # 侧边栏
│   ├── Homepage       # 首页内容
│   └── HomepageHero   # 首页 Hero 区域
└── plugin           # dumi 插件文件夹，plugin/index.ts（也可以是 plugin.ts）会被自动注册为插件
    └── index.ts
```

除了以上目录外的其他目录不做约定，开发者可根据实际需要创建诸如 `utils`、`hooks`、`styles` 之类的文件夹，可以访问 dumi 内置的默认主题来查看主题包目录结构的实际范例：https://github.com/umijs/dumi/tree/master/src/client/theme-default ；如果不存在某个文件夹或文件，将会兜底到 dumi 的默认主题。

所以主题包的开发可以是渐进式的，能局部覆盖、也能全部定制，那么覆盖和定制的运作逻辑是怎样的呢，请接着往下看。

## 主题加载

dumi 的主题系统中，一共有 3 种主题加载的来源，优先级从低到高分别是：

1. 内置的默认主题包，通过 `dumi/theme-default/xx` 可以访问到默认主题的产物
2. 用户安装的主题包，在 `package.json` 中以 `dumi-theme-` 或 `@org/dumi-theme-` 开头的包会被自动加载为主题
3. 用户的本地主题包，在 `.dumi/theme` 目录下放置的主题文件，通常用于对默认主题或安装主题包的局部覆盖及扩展

上述 3 种来源按优先级合并、覆盖后的结果，就是项目运行的最终主题。加载时的合并、覆盖逻辑有如下几种：

### 组件加载

其中，`builtins`、`layouts`、`slots` 文件夹下的组件均按组件名进行合并 + 覆盖，例如：

| 组件名 | 默认主题 | 安装主题 | 本地主题 | 最终结果   |
| ------ | -------- | -------- | -------- | ---------- |
| `A`    | 不提供   | 不提供   | 提供     | 本地主题 A |
| `B`    | 提供     | 提供     | 提供     | 本地主题 B |
| `C`    | 提供     | 提供     | 不提供   | 安装主题 C |
| `D`    | 提供     | 不提供   | 不提供   | 默认主题 D |

总结：优先级更高的主题来源如果提供与优先级更低主题来源的同名组件，会覆盖后者提供的组件；如果优先级更高的主题来源没有提供该组件，会使用优先级更低的主题来源的组件。

:::warning
由于 slots 下的组件通常被布局组件引用，如果优先级更高的主题来源直接覆盖了布局组件，通常会导致其引用的 slots 插槽失效，所以建议在本地主题包中覆盖布局组件时，只对其进行引用包装而不是直接替换；而主题包通常是要全量定制主题，则可以放心替换布局组件。
:::

### 文案加载

而 `locales` 文件夹下的文案配置则是按语言类型进行内容合并，用伪代码示意大致如下：

```ts
最终zh-CN.json = Object.assign(默认主题zh-CN.json, 安装主题zh-CN.json, 本地主题zh-CN.json)
```

所以我们可以在本地主题包中局部覆盖默认主题或安装主题包的文案。

### 插件加载

最后是 `plugin/index.ts` 或 `plugin.ts` 的插件文件，它是个特例、不会被合并，只要存在就会被加载注册成 dumi 插件。

## 主题的引用别名

为了能让主题系统顺利运作，dumi 参考 Docusaurus 的 Swizzing 设计、为开发者提供了如下引用别名：

### `dumi/theme/{layouts,builtins,slots}/xx`

- 作用：该别名指向主题解析的最终结果，包含本地主题，dumi 内部编译时会使用该别名去引用主题的组件
- 何时使用：

独立主题包的开发者通常不需要关心该别名，因为 dumi 提供的主题包研发脚手架会在构建时自动将主题包内 `slots` 的相对路径引用替换成 `dumi/theme/slots/xxx` 的形式，以确保插槽的覆盖可以正常工作；除非开发者有特殊需要，比如想在布局组件中引用 builtins 下的组件，那么就需要使用该别名以确保 builtins 下的组件可以被用户覆盖。

使用本地主题包的用户也不建议使用该别名，由于该别名的解析结果包含本地主题，可能会引起循环引用，所以对本地主题包而言，建议使用下面的 `dumi/theme-original` 别名来引用组件。

### `dumi/theme-original/{layouts,builtins,slots}/xx`

- 作用：该别名指向默认主题包、安装主题包及插件修改后的主题解析结果，不含本地主题包
- 何时使用：

仅建议本地主题包的用户使用该别名，通常用于局部包装替换某个内置组件，比如想在内置的 TOC 组件下面下一个返回顶部的按钮。

### `dumi/theme-default/xx`

- 作用：该别名指向 dumi 内置的默认主题包
- 何时使用：

独立主题包或者本地主题包需要显式引入默认主题包内的组件时使用，比如开发主题包时觉得默认主题中的某个内置组件可以复用，那么就可以使用该别名引入。

## 更多

除了主题包之外，dumi 也提供了插件 API 对 `dumi/theme-original` 别名指向的解析结果进行修改，具体请等待后续插件文档补充。
