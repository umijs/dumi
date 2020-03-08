# 控制菜单生成

## 约定式菜单规则

dumi 的文档菜单是建立在路由结构上的。路由的嵌套关系会被 dumi 解析为菜单分组，先看看 dumi 会怎么识别路由结构：

```bash
/                       # 未分组
/guide                  # 指南分组
/guide/help             # 指南分组
/other                  # 其他分组
/very/very/deep/child   # 注意，/very/very/deep 会被整个识别为分组
```

然后这个识别结果会被展示为：

- 根路径
- guide
  - guide
  - help
- other
- very/very/deep
  - child

和预期基本一致，但这里有个问题：`very/very/deep` 下面只有一个子项的时候还展示为分组非常奇怪，为了满足特殊场景（真的需要对单独子项做分组）和常规场景（省略分组），dumi 有个设定：

**当分组名与子路由标题一致且只有一个子路由时**，该项就不会展示为分组了，就像 `other` 分组一样。但如何配置分组名呢？请接着往下看。

### 控制分组名称

分组名称的默认生成规则是，取分组的路由名称去掉 `/` 并首字母大写。比如，路由是 `/guide/help`，dumi 将会去掉末端路由 `/help` 将 `/guide` 当做分组，并且去掉 `/` 再首字母大写变成 `Guide`。

如果希望手动控制分组名称，可以使用 [名为 `group.title` 的 frontmatter 配置项](/config/frontmatter#grouptitle) 进行配置。

### 控制分组路径

分组路径的默认生成规则是，将路由的最后一段去掉，前面无论多长都会作为分组路径。比如，路由是 `/very/very/deep/child`，那么 `very/very/deep` 则会作为分组路径。

如果希望手动控制分组路径，可以使用 [名为 `group.path` 的 frontmatter 配置项](/config/frontmatter#grouppath) 进行配置。

### 控制分组排序

分组的默认排序规则为，先对比 `path` 的长度，例如 `/guide` 肯定排在 `/guide/help` 前面，其次对比分组名称的 ASCII 码，比如 `Guide` 肯定排在 `Help` 前面。

如果希望手动控制分组顺序，可以使用 [名为 `group.order` 的 frontmatter 配置项](/config/frontmatter#grouporder) 进行配置，数字越小越靠前。

## 配置式侧边菜单

<Alert>注意：目前仅 <code>site</code> 模式下可用。</Alert>

如果发现约定式无法满足需要，可通过 [`menus` 配置项](/config#mennus) 对侧边菜单进行**增量自定义**：

```ts
// config/config.ts 或 .umirc.ts
export default {
  // 单语言配置方式如下
  menus: {
    // 需要自定义侧边菜单的路径，没有配置的路径还是会使用自动生成的配置
    '/guide': [
      {
        title: '菜单项',
        path: '菜单路由（可选）',
        children: [
          // 菜单子项（可选）
          'guide/index.md', // 对应的 Markdown 文件，路径是相对于 resolve.includes 目录识别的
        ],
      },
    ],
  },

  // 多语言配置方式如下
  menus: {
    // 多语言 key 值需与 locales 配置中的 key 一致
    'en-US': {
      // 需要自定义侧边菜单的路径，没有配置的路径还是会使用自动生成的配置
      '/guide': [
        // 省略，配置同单语言模式
      ],
    },
    'zh-CN': {
      // 需要自定义侧边菜单的路径，没有配置的路径还是会使用自动生成的配置
      '/guide': [
        // 省略，配置同单语言模式
      ],
    },
  },
};
```
