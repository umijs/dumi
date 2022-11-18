---
group: 进阶
order: 1
---

# 页面 Tab

dumi 支持组件页面的 Tab 自定义，分为以下两种方式

## 约定式

```bash
.
├── src
│   ├── Foo
│   │   ├── index.md
│   │   └── index.$tab-api.md  # Tab 内容
```

约定式就是不用手写配置，通过判断 md 文件命名是否带有 `$tab-` ，此文件将作为 Tab 的内容部分，如上所示，`index.$tab-api.md` 会作为 `index.md` 的 Tab 呈现。此处 `api` 作为 Tab 的 key 值，如果需要配置 Tab 标题，可以使用 FrontMatter 来定义。

## 通过插件注册

为了便于插件对 Tab 进行统一扩展，dumi 还提供了插件 API : `addContentTab` ，我们可以使用它为指定路由添加 Tab。

```ts
// plugin.ts
import { IApi } from 'dumi';

export default (api: IApi) => {
  api.addContentTab(() => ({
    key: 'test',
    component: require.resolve('./a.tsx'),
    test: '/^/components//',
  }));
};
```

`component` 放入我们自定义的 Tab 内容，`test` 可以写入正则来匹配路由，这样我们就实现了为 `/componets` 下的路由页面添加自定义 Tab。
