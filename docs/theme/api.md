---
group: 开发
---

# API

:::warning
dumi 提供的所有 API 均依赖 dumi 框架提供的编译时及运行时环境，所以这些 API 只能用于主题包开发或本地主题定制，请勿在项目源码（例如组件）中使用这些 API，将会导致项目发布后功能异常！
:::

dumi 2 基于 Umi 4，除了自身特有的 API 以外，同样也支持 Umi 4 提供的基础 API，两者均从 `dumi` 包名中引入。

```ts
import { useLocale, useAppData } from 'dumi';

// 其他逻辑
```

## 重点配置项

### openCodeSandbox

- 作用：在 CodeSandbox 中打开传入的 demo
- 场景：自定义 demo 预览器按钮 `PreviewerActions` 时可能需要用到
- 用法：

假设在项目中创建 `.dumi/theme/slots/PreviewerActions.tsx` 用于覆盖默认的预览器按钮：

```tsx | pure
import { openCodeSandbox } from 'dumi';
import DumiPreviewerActions from 'dumi/theme-default/slots/PreviewerActions';
import React from 'react';

const PreviewerActions: typeof DumiPreviewerActions = (props) => (
  <button type="button" onClick={() => openCodeSandbox(props)}>
    点我在 CodeSandbox 里打开 demo
  </button>
);
```

### useAtomAssets

- 作用：获取所有的原子资产元数据
- 场景：定制 API 表格、创建资产索引页等场景可能需要用到
- 用法：

```ts
import { useAtomAssets } from 'dumi';

const Example = () => {
  const assets = useAtomAssets();
  // 返回值：Record<string, AtomComponentAsset>
  // 类型定义：https://github.com/umijs/dumi/tree/master/assets-types/typings/atom/index.d.ts#L37

  // 其他逻辑
};
```

### useFullSidebarData

- 作用：获取所有路径下的侧边栏数据，如果希望获取当前路径的侧边栏数据，请使用 `useSidebarData` API
- 场景：定制侧边栏时可能需要用到
- 用法：

```ts
import { useFullSidebarData } from 'dumi';

const Example = () => {
  const sidebar = useFullSidebarData();
  // 返回值：Record<string, ISidebarGroup[]>
  // 类型定义：https://github.com/umijs/dumi/tree/master/src/client/theme-api/types.ts#L140

  // 其他逻辑
};
```

### useLocale

- 作用：获取当前的国际化语言数据
- 场景：实现与国际化相关的功能时可能需要用到
- 用法：

```ts
import { useLocale } from 'dumi';

const Example = () => {
  const locale = useLocale();
  // 返回值：{ id: string; name: string; base: string } | { id: string; name: string; suffix: string }
  // 类型定义：https://github.com/umijs/dumi/tree/master/src/client/theme-api/types.ts#L121

  // 其他逻辑
};
```

### useNavData

- 作用：获取导航栏数据
- 场景：定制导航栏时需要用到
- 用法：

> 注意，由于后续会支持二级导航，该 hook 的返回数据结构可能会有些许调整

```ts
import { useNavData } from 'dumi';

const Example = () => {
  const nav = useNavData();
  // 返回值：INavItem[]
  // 类型定义：https://github.com/umijs/dumi/tree/master/src/client/theme-api/types.ts#L126

  // 其他逻辑
};
```

### useRouteMeta

- 作用：获取当前路由的元数据
- 场景：定制页面功能（例如渲染 toc、定制 Tabs 实现等）时可能需要用到
- 用法：

```ts
import { useRouteMeta } from 'dumi';

const Example = () => {
  const {
    // Markdown/React 的 frontmatter
    frontmatter,
    // 页面标题数据
    toc,
    // 页面文本数据
    texts,
    // 页面 Tab 数据
    tabs,
  } = useRouteMeta();
  // 返回值：IRouteMeta
  // 类型定义：https://github.com/umijs/dumi/tree/master/src/client/theme-api/types.ts#L48

  // 其他逻辑
};
```

### useSiteData

- 作用：获取站点配置数据
- 场景：定制全局功能（例如获取用户的主题配置、获取全局的 demo 数据、定制页面编辑链接）时可能需要用到
- 用法：

```ts
import { useSiteData } from 'dumi';

const Example = () => {
  const {
    // 项目的 package.json 数据
    pkg,
    // 项目全量的 demo 数据
    demos,
    // 项目全量的组件数据（如果只需要单独获取这一份数据，请使用 useAtomAssets）
    components,
    // 项目的 locales 配置
    locales,
    // 用户从 .dumirc.ts 传入的 themeConfig
    themeConfig,
    // 当前页面的加载状态，由于默认启用路由按需加载，所以切换路由时会有 loading 的过程
    loading,
  } = useSiteData();
  // 返回值：ISiteContext
  // 类型定义：https://github.com/umijs/dumi/tree/master/src/client/theme-api/context.ts#L6

  // 其他逻辑
};
```

### useSidebarData

- 作用：获取当前路径下的侧边栏数据
- 场景：定制侧边栏时可能需要用到
- 用法：

```ts
import { useSidebarData } from 'dumi';

const Example = () => {
  const sidebar = useSidebarData();
  // 返回值：ISidebarGroup[]
  // 类型定义：https://github.com/umijs/dumi/tree/master/src/client/theme-api/types.ts#L140

  // 其他逻辑
};
```

### useSiteSearch

- 作用：获取全文搜索的数据及方法
- 场景：定制搜索框时可能需要用到
- 用法：

```ts
import { useSiteSearch } from 'dumi';

const Example = () => {
  const {
    // 当前关键词（用于创建受控输入框）
    keywords,
    // 设置搜索关键词
    setKeywords,
    // 搜索结果
    // 类型定义：https://github.com/umijs/dumi/tree/master/src/client/theme-api/useSiteSearch.ts#L25
    result,
    // 是否在搜索中
    loading,
  } = useSiteSearch();

  // 其他逻辑
};
```

### useTabMeta

- 作用：获取当前 Tab 的元数据（仅页面存在 Tab 时且切换到某个 Tab 时才有返回值）
- 场景：定制 Tab 实现的时候可能需要用到
- 用法：

```ts
import { useTabMeta } from 'dumi';

const Example = () => {
  const {
    // Markdown/React 的 frontmatter
    frontmatter,
    // 页面标题数据
    toc,
    // 页面文本数据
    texts,
  } = useTabMeta();
  // 返回值：IRouteTabMeta
  // 类型定义：https://github.com/umijs/dumi/tree/master/src/client/theme-api/types.ts#L108

  // 其他逻辑
};
```

## 基础配置项

<embed src="../.upstream/api.md"></embed>
