# Control route generate

## Convention Routing rules

As same as Umi, dumi has a set of routing generation conventions.

Dumi will generate routes based on the base detection path which is taken by the value of the configuration item of [`resolve.includes`](/config#includes). If we do not configure this value, dumi will detect the `docs`, `src`(normal projects), `packages/pkg/src`(lerna projects) directory by default.

It is assumed that `docs` has the following directory structure, dumi will identify it like this:

```bash
.
└── docs/
    ├── index.md       # generate '/' route
    ├── index.zh-CN.md # generate '/zh-CN' route
    ├── examples.md    # generate '/examples' route
    ├── guide
    |   ├── README.md  # generate '/guide' route
    |   ├── help.md    # generate '/guide/help' route
```

It can be found that, except for the multi-language part, it is very similar to rules of Umi for identifying `tsx/jsx` Convention routes.

In addition, dumi will convert camel cased(camelCased) to kebab case(kebab-case), for example, `docs/gettingStarted` will be converted to `docs/getting-started`.

### Page title

The default rule of generating page title is to take the last segment of the current route and capitalize it. For example, if the route is `/guide/help`, dumi will take the end route `help` and capitalize it to `Help`.

If you want to control the page title in manual way, you can configure it through [名为`title` 的 frontmatter 配置项](/config/frontmatter#title)

### Page order

In the side menu, the pages will be sorted according to the rules.

The default rule of the page sorting is: firstly, compare the length of `path`, for example `/guide` must be in front of `/guide/help`, and then compare the ASCII of page name, for example, `Guide` must be in front of `Help`.

If you want to control the page order in manual way, you can configure it through [名为`order` 的 frontmatter 配置项](/config/frontmatter#order). The smaller the number, the more previous the rank will be.

### Page route

At present, the route of the page itself cannot be customized. Dumi will abide by the agreement that name is route. If you want to change the route of the page, for example, changing the `help` in `/guide/help` to `other`, it is recommended that change `help.md` to `other.md`.

However, except the route of the page itself, the route of the menu and navigation to which the page belongs can be changed. For more, please refer to [控制菜单分组路径](/guide/control-menu-generate#控制分组路径) and [控制导航分组路径](/guide/control-nav-generate#控制导航路径).

## Configuring Routing

Generally, it is recommended to use the conventional routing directly. If it can not satisfy the requirements, can also configure through [`config.routes`](/config#routes). The usage is the same as Umi, but there are two points to notice:

1. Only support to configure `.md` as a routing component for now. The standard `module` will be supported in the future
2. To traversal of routes at runtime, dumi flattens all nested routes. If there are parent components in nested routes, it will be wrapped through the Umi's configuration of [`wrappers`](https://umijs.org/docs/routing#wrappers)
