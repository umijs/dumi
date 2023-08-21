---
title: 自动 API 表格
group: 进阶
order: 2
---

# 自动 API 表格<Badge>实验性</Badge>

:::warning{title="功能限制"}
由于该特性仍在实验性阶段，存在如下限制，未来可能会有变动或改进：

- API 表格仅支持展示解析出的顶层属性
- `@description` 不支持多语言配置
- Windows 操作系统上会工作不正常，目前不建议使用
:::

dumi 支持基于 JSDoc 及 TypeScript 类型定义自动为 React 组件生成 API 表格，降低 API 文档的维护成本。

## 使用方式

首先在 `.dumirc.ts` 中打开 `apiParser` 的配置项，并配置 `entryFile` 的路径：

```ts
import { defineConfig } from 'dumi';

export default defineConfig({
  apiParser: {},
  resolve: {
    // 配置入口文件路径，API 解析将从这里开始
    entryFile: './src/index.tsx',
  },
});
```

然后在入口文件中导出组件模块，可以直接 export，也可以从其他模块 re-export，例如：

```tsx | pure
// src/index.tsx
import React, { type FC } from 'react';

export const Foo: FC<{
  /**
   * @description 属性描述
   * @default "默认值"
   */
  title?: string;
}> = ({ title }) => <h1>{title}</h1>;
```

最后在 Markdown 文件中使用 API 组件即可：

```md
<API id="Foo"></API>
```

上述代码将会被渲染为：

| 属性名 | 描述     | 类型     | 默认值   |
| ------ | -------- | -------- | -------- |
| title  | 属性描述 | `string` | `默认值` |

## 注意事项

1. 默认值和必选是互斥的，所以如果属性是必选，`@default` 值将不会生效
2. 仅支持解析入口文件导出的 React 组件，不支持指定文件解析
3. `API` 组件必须使用双标签，对 Markdown 而言双标签才是合法的 HTML
