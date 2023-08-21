---
nav: 指南
group: 基础
order: 3
---

# 约定式路由

即根据路由文件路径自动生成路由，是 dumi 默认且推荐使用的路由模式。在 dumi 里，约定式路由一共有 3 种读取方式，分别是：

| 类型                                                 | 默认读取路径                                            | 适用场景及特点                                                                                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文档路由                                             | `docs`                                                  | 适用于普通文档生成路由，路径下的文档会根据嵌套结构自动识别并归类到不同的导航类目下                                                                    |
| 资产路由                                             | `src`                                                   | 适用于资产（比如组件或 hooks）文档的生成，路径下**第一层级**的文档会被识别并归类到指定的类别下，dumi 默认会将 `src` 下的文档都归类到 `/components` 下 |
| <span style="white-space: nowrap;">React 路由</span> | <span style="white-space: nowrap;">`.dumi/pages`</span> | 适用于为当前站点添加额外的、无法用 Markdown 编写的复杂页面，这些页面必须使用 React 编写，识别规则与文档路由一致                                       |

## 路由识别及转换

dumi 的路由识别规则如下：

- 在识别文档路由时，dumi 会自动过滤掉以 `.` 和 `_` 开头的文件及文件夹，仅识别 `.md` 后缀的文件，识别路径可通过 [`resolve.docDirs`](../config/index.md#resolve) 进行修改；
- 在识别资产路由时，dumi 仅识别第一层级的 `.md` 文件及第二层级的 `index.md`、`README.md` 文件，并自动为路由路径加上资产类别前缀（`type` 配置项），识别路径及资产类别前缀可通过 [`resolve.atomDirs`](../config/index.md#resolve) 进行修改；
- 在识别 React 路由时，dumi 会自动过滤掉以 `.` 和 `_` 开头的文件及文件夹，仅识别 `.tsx`、`.ts`、`.jsx` 和 `.js` 后缀的文件，过滤规则可通过 [`conventionRoutes.exclude`](../config/index.md#conventionroutes) 进行修改。

除此之外，为了使得 URL 更加友好，dumi 会自动将文件路径中的驼峰命令（CamelCase）转换为中划线命名（kebab-case），例如 `docs/HelloWorld.md` 最终会生成 `/hello-world`。

## 文档标题及排序

dumi 会自动将 Markdown 文件中的第一个标题作为该文档的标题，如果没有标题，则会使用文件名作为标题，以及在同一导航类目、同一菜单分组下的文档，默认按照字典序排序。

这两者都可以在该文档的 Markdown 源文件头部通过 FrontMatter 手动指定，比如：

```md
title: 文档标题
order: 1 <!-- order 越小越靠前，默认为 0 -->
```

## 导航归类及生成

dumi 始终以路由路径作为导航归类的依据，拥有相同父级路径的文档会被归类到同一个导航类目下，例如 `/config` 和 `/config/advanced` 会被归类到 `Config` 导航类目下。

导航的名称默认为该导航类目下第一篇文档的分组标题或文档标题，导航的排序默认按照字典序排序，这两者都可以在该导航类目下**任一文档**的 Markdown 源文件头部通过 FrontMatter 指定，比如：

```md
---
# 单独设置导航名称
nav: 配置项
# 同时设置导航名称和顺序，order 越小越靠前，默认为 0
nav:
  title: 配置项
  order: 1
---
```

### 约定式二级导航 <Badge>2.2.0+</Badge>

<embed src="../config/markdown.md#RE-/<!-- 2-level nav warning[^]+ 2-level nav warning end -->/"></embed>

同时，为了便于组织文档，dumi 还支持生成二级导航，使用起来也非常简单，以如下目录结构为例：

```bash
docs
└── platforms
    ├── pc
    │   ├── index.md
    │   └── faq.md
    └── mobile
        ├── index.md
        └── faq.md
```

根据一级导航的规则，上面所有的 Markdown 必然都归属于 `Platforms` 导航，但同时它们还会分别归属于 `Pc` 和 `Mobile` 这两个二级导航，这是因为这些路由路径除了拥有共同的 `/platforms` 前缀外，还拥有各自的二级路径前缀，即 `/pc` 和 `/mobile`，二级导航的 UI 效果如下：

<style>
  #two-level-nav-preview {
    background-image: url(https://gw.alipayobjects.com/zos/bmw-prod/f1bc7aba-c1b5-41a1-bb00-7a713a6c791f/li8agnz8_w312_h252.jpeg);
  }
  [data-prefers-color="dark"] #two-level-nav-preview {
    background-image: url(https://gw.alipayobjects.com/zos/bmw-prod/2ba687cd-4dd2-4a14-94df-38986a5beb0e/li8angg8_w312_h252.jpeg);
  }
</style>
<div style="width: 156px; height: 126px; background-size: cover;" id="two-level-nav-preview"></div>

二级导航的名称及顺序的默认规则与一级导航一致，类似的，我们也可以在该二级导航类目下**任一文档**的 Markdown 源文件头部通过 FrontMatter 指定，比如：

```md
---
nav:
  # 单独设置二级导航名称
  second: 移动端
  # 同时设置二级导航名称和顺序，order 越小越靠前，默认为 0
  second:
    title: 移动端
    order: 1
---
```

最后，在创建约定式二级导航时，还有一些规则是需要我们注意的：

1. 在相同一级路径下，二级及三级路径存在 2 组及以上时才能形成二级导航，比如上述例子中如果 `mobile` 文件夹不存在，则不会形成二级导航，但倘若添加 `platforms/xxx.md` 又可以形成二级导航；
2. 在相同一级路径下，如果仅存在三级路径，则只展示下拉菜单，一级导航本身不带超链，比如上述例子中的 `Platforms` 导航就不带超链；
3. 在相同一级路径下，在 2 的基础上还存在二级或一级路径，则一级导航除了下拉菜单外也带超链，比如上述例子中如果添加 `platforms/xx.md` 则 `Platforms` 带超链；
4. 不同级导航之间的侧边菜单是完全隔离的，比如上述例子中 `Platforms`、`Pc`、`Mobile` 都拥有不同的菜单；
5. 资产路由本身不支持嵌套，但我们仍然可以通过 [`resolve.atomDirs[n].subType`](../config/index.md#resolve) 配置项实现二级导航，比如 `[{ type: 'component', subType: 'pc' dir: 'src' }]` 会为 `src/xx/index.md` 生成 `/components/pc/xx` 路由，以满足二级导航的路径规则。

## 菜单归类及生成

dumi 默认会将同一导航类目下的所有文档都归类到默认菜单分组下，默认菜单分组没有分组名称，且默认排序会先于其他分组。

倘若你的文档比较多，希望像这篇文档左边的菜单一样，将相关联的文档归类到同一菜单分组下，可以在相关文档的 Markdown 源文件头部通过 FrontMatter 指定它的分组及分组顺序，比如：

```md
---
# 单独设置分组名称
group: 基础
# 同时设置分组名称和顺序，order 越小越靠前，默认为 0
group:
  title: 基础
  order: 1
---
```

与导航不同的是，需要归类的每一篇文档都需要设置菜单分组名称，但菜单分组顺序仅需要**任一文档**设置即可生效。

## 解析示例

| 磁盘路径                   | 路由类别   | 解析结果                                                  |
| -------------------------- | ---------- | --------------------------------------------------------- |
| docs/hello.md              | 文档路由   | - 导航：Hello<br>- 页面路由：/hello                       |
| docs/hello/index.md        | 文档路由   | - 导航：Hello<br>- 页面路由：/hello                       |
| docs/hello/world/dumi.md   | 文档路由   | - 导航：Hello<br>- 页面路由：/hello/world/dumi            |
| src/HelloWorld.md          | 资产路由   | - 导航：Components<br>- 页面路由：/components/hello-world |
| src/HelloWorld/index.md    | 资产路由   | - 导航：Components<br>- 页面路由：/components/hello-world |
| .dumi/pages/hello.tsx      | React 路由 | - 导航：Hello<br>- 页面路由：/hello                       |
| docs/\_hello.md            | --         | 不识别，原因：以 `_` 开头                                 |
| src/hello/world.md         | --         | 不识别，原因：资产路由只识别第一层级                      |
| src/hello/another/index.md | --         | 不识别，原因：资产路由只识别第一层级                      |
| .dumi/pages/hello.md       | --         | 不识别，原因：React 路由不识别 `.md` 后缀                 |
