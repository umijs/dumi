---
group:
  title: 其他
  order: 3
---

# 从 dumi 1.x 升级

参考该文档可将 dumi 1.x 项目升级到 dumi 2.0，如果你的项目是从 dumi 1.x 早期的组件研发脚手架初始化，建议同时将项目中的 father-build [升级到 father 4](https://github.com/umijs/father/blob/master/docs/guide/upgrading.md)，以获得更好的组件源码构建体验。

## 环境检查

dumi 2.0 最低支持 Node.js v14 版本，升级前请确保设备安装的 Node.js 版本是 14+。

## 项目模板升级

### 方案一：重新初始化

倘若在 dumi 1.x 初始化模板的基础上改动不大，建议[使用 `create-dumi` 重新初始化](./initialize)一套模板，将源码及文档拷贝进去、再做适当调整验证。

确保以下操作是在 git 仓库中进行，且工作区是干净的：

```bash
$ git rm -rf ./*        # 清空现有仓库文件（仅工作区清空，文件仍受 Git 版本控制）
$ npx create-dumi       # 然后选择需要的模板
$ rm -rf docs src       # 删除初始化模板的 docs 及 src
$ git checkout src docs # 恢复原有的源码及文档
```

至此模板升级完成，可进行后续的文档及配置升级。

### 方案二：手动升级

倘若在 dumi 1.x 初始化模板的基础上改动较大，建议手动升级做最小化调整，步骤如下：

#### 更新 package.json

```diff
{
  "scripts": {
+   "prepare": "dumi setup"
  },
  "devDependencies": {
-   "dumi": "^1.0.0",
+   "dumi": "^2.0.0"
  }
}
```

#### 更新 tsconfig.json

```diff
{
  "compilerOptions": {
    "paths": {
+     "@@/*": [".dumi/tmp/*"]
    }
  }
}
```

#### 更新 .gitignore

```diff
- .umi
- .umi-test
- .umi-production
+ .dumi/tmp
+ .dumi/tmp-test
+ .dumi/tmp-production
```

#### 更新外部引入 demo

单标签改为双标签。

```diff
- <code src="path/to/demo.tsx" />
+ <code src="path/to/demo.tsx"></code>
```

## 项目文件升级

dumi 2.0 将使用特有的 `.dumirc.ts` 作为配置文件，请将原有的 `.umirc.ts` 或者 `config/config.ts` 重命名为 `.dumirc.ts`，并做如下调整：

```diff
+ import { defineConfig } from 'dumi';


- export default {
+ export default defineConfig({
   # 以下为文档配置升级
   # 已内置全文搜索，默认不再集成 algolia，有需要可以手动覆盖 SearchBar 组件
-  algolia: { ... },
   # 由于 doc 模式已废弃，所以该配置项也一并废弃
-  mode: 'doc',
   # dumi 1.x 用 title 作为组件库名称，如果你希望设置的是组件库名称而非页面标题，请改用 name
-  title: 'xxx',
+  themeConfig: { name: 'xxx' },
   # logo 配置项升级
-  logo: 'xxx',
+  themeConfig: { logo: 'xxx' },
   # menus 升级为 themeConfig.sidebar
-  menus: [...],
+  themeConfig: {
+    sidebar: {
+      '/guide': {
+        title: '分组名称（可选）',
+        children: [{ title: '标题', link: '链接' }],
+      },
+    },
+  },
   # navs 升级为 themeConfig.nav
-  navs: [...],
+  themeConfig: {
+    nav: [{ title: '标题', link: '链接' }],
+  },
   # locales 配置格式升级
-  locales: [['zh-CN', '中文']],
+  locales: [{ id: 'zh-CN', name: '中文' }], // 2.0 默认值
   # resolve 配置项升级
   resolve: {
     # 拆分普通文档解析（多层）和资产文档（单层 + 按分类添加路由前缀）解析，可访问约定式路由了解更多
-    includes: ['docs', 'src'],
+    docDirs: ['docs'], // 2.0 默认值
+    atomDirs: [{ type: 'component', dir: 'src' }], // 2.0 默认值
     # passive 配置项升级，用 codeBlockMode 替代
-    passivePreview: true,
+    codeBlockMode: 'passive',
     # 废弃，由注册的技术栈决定解析什么语言的 demo
-    previewLangs: [...],
   },
   sitemap: {
-    excludes: [...],
     # sitemap.excludes 配置项升级
+    exclude: [...],
   },
   # apiParser 的子配置项暂不支持，后续版本会支持
   apiParser: {
-    ...
   },

   # 以下为基础配置升级
   # favicon 配置项升级
-  favicon: 'xxx',
+  favicons: ['xxx'],
   # 已废弃，默认开启动态加载
-  dynamicImport: {},
   # 默认开启
-  fastRefresh: {},
   # 默认使用 webpack 5
-  webpack5: {},
});
```

Monorepo 模式下特别注意 🚨：

由于 `dumi 2` 不再感知 `monorepo` ，因此会出现热更新失效的问题，需要手动配置包名到 src 的 alias。

```ts
alias: {
  pkg: path.join(__dirname, 'packages/pkg/src');
}
```

## 目录结构升级

由于 dumi 2.0 拆分了普通文档与资产文档的解析逻辑，其中资产文档的解析**仅识别解析路径顶层 md 及顶层下的 index.md**，所以在 `src` 下的文档目录结构可能需要做调整，例如：

```bash
.
└── src
    ├── Foo
    │   ├── index.md     # ✅ 识别
    │   └── a.md         # ❗️ 非 index.md 不再识别
    ├── components
    │   └── Bar
    │       └── index.md # ❗️ 嵌套层级不再识别
    └── Hello.md         # ✅ 识别
```

如果不方便调整结构，可以通过配置 `resolve.atomDirs` 来指定识别的目录，例如：

```diff
export default {
  resolve: {
    atomDirs: [
      { type: 'component', dir: 'src' }, // 默认值
      # 追加一个组件资产的解析目录
+     { type: 'component', dir: 'src/components' },
    ]
  }
}
```

Monorepo 模式下

```diff
export default {
  resolve: {
    atomDirs: [
      { type: 'component', dir: 'src' }, // 默认值
      # 做顶级路由的区分，被解析到的 md 均有对应 `type` 复数形式的路由前缀，例如 `/basic-components/foo`
+     { type: 'basic-component', dir: 'packages/basic/src' },
+     { type: 'complex-component', dir: 'packages/complex/src' },
    ]
  }
}
```

## FrontMatter 升级

Markdown 头部支持的 frontmatter 有如下变化：

```diff
---
  nav:
    # 不支持配置路径，以文件夹目录结构为准
-   path: /xxxx
  group:
    # 不支持配置路径，group 没有路径的概念了
-   path: /xxxx
  # 已废弃
- legacy: /xxxx
  hero:
    # 新的默认主题不支持展示 hero 图片
-   image: xxxx
    # desc 配置项升级
-   desc: xxxx
+   description: xxxx
  features:
    # 新的默认主题只支持配置 emoji 作为图标
-   - icon: xxxx
+   - emoji: 🚀
    # desc 配置项升级
-     desc: xxxx
+     description: xxxx
  # 请在 .dumirc.ts 的 themeConfig.footer 中配置
- footer: xxx
  # 已废弃
- translateHelp: true
  # hide 配置项升级为 debug
- hide: true
+ debug: true
  # 以下配置暂不支持，后续版本会支持
- sidemenu: false
---
```

Demo 支持的 frontmatter 有如下变化：

```diff
/**
   # desc 配置项升级
-* desc: xxxx
+* description: xxxx
   # 已废弃，可通过覆盖 PreviewerActions 组件实现全局控制
-* hideActions: ['xxx']
 */
```

至此，可以启动 dev server 验证项目运行情况，如果没什么异常就意味着升级完成了，如果升级过程中碰到任何问题，欢迎到 [GitHub 讨论区](https://github.com/umijs/dumi/discussions/1216)内反馈。
