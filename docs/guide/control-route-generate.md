# 控制路由生成

## 约定式路由规则

dumi 和 Umi 一样，有一套路由生成的约定。

生成均以 [`resolve.includes`](/config#includes) 配置项的值作为基础检测路径，倘若我们不配置该值，则会默认探测 `docs` 目录、`src` 目录（普通项目）、`packages/pkg/src` 目录（lerna 项目）。

假定 `docs` 有如下目录结构，dumi 会这么进行识别：

```bash
.
└── docs/
    ├── index.md       # 生成 / 路由
    ├── index.zh-CN.md # 生成 /zh-CN 路由
    ├── examples.md    # 生成 /examples 路由
    ├── guide
    |   ├── README.md  # 生成 /guide 路由
    |   ├── help.md    # 生成 /guide/help 路由
```

可以发现，除了多语言的部分，和 Umi 对 `tsx/jsx` 约定式路由的识别规则非常类似。

另外，dumi 会将驼峰命名（camelCased）转换为短横线命名（kebab-case），例如 `docs/gettingStarted` 会被转化为 `docs/getting-started`。

### 控制页面名称

页面名称的默认生成规则是，取当前路由的最后一段并首字母大写。比如，路由是 `/guide/help`，dumi 将会取末端路由 `help` 并首字母大写变成 `Help`。

如果希望手动控制页面名称，可以使用 [名为`title` 的 frontmatter 配置项](/config/frontmatter#title) 进行配置。

### 控制页面排序

在侧边菜单中，各页面会按照规则进行排序展示。

页面的默认排序规则为，先对比 `path` 的长度，例如 `/guide` 肯定排在 `/guide/help` 前面，其次对比页面名称的 ASCII 码，比如 `Guide` 肯定排在 `Help` 前面。

如果希望手动控制页面顺序，可以使用 [名为`order` 的 frontmatter 配置项](/config/frontmatter#order) 进行配置，数字越小越靠前。

### 控制页面路由

目前，页面自身的路由无法自定义，dumi 会保留名称即路由的约定，如果希望修改页面的路由，例如将 `/guide/help` 中的 `help` 修改为 `other`，那么建议把 `help.md` 改为 `other.md`。

但除开页面自己的路由，页面所属菜单分组和导航分组的路由是可以修改的，详见 [控制菜单分组路径](/guide/control-menu-generate#控制分组路径) 以及 [控制导航分组路径](/guide/control-nav-generate#控制导航路径)。

## 配置式路由

通常推荐直接使用约定式路由，倘若不能满足需要，也可以通过 [`config.routes`](http://localhost:8000/config#routes) 配置项来进行配置，用法和 Umi 一样，但有两点需要注意：

1. 目前仅支持配置 `.md` 作为路由组件，后续会进行扩展支持标准的 `module`
2. 为了便于在运行时对路由进行遍历，dumi 会把所有嵌套式路由拉平，如果嵌套的路由有父级组件，会通过 Umi 的 [`wrappers`](https://umijs.org/docs/routing#wrappers) 路由配置项进行包裹
