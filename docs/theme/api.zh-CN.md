---
order: 3
toc: menu
---

# 主题 API

为了便于自定义主题，dumi 提供了一套主题 API，我们可以从 `dumi/theme` 中 import 出以下内容。

## context

可获取到 dumi 的配置项、当前路由的 meta 信息、国际化语言选择项等等，context 的详细定义可 <a target="_blank" href="https://github.com/umijs/dumi/blob/master/packages/preset-dumi/src/theme/context.ts#L8">查看源代码</a>

## Link

包装后的 umi `Link`，可渲染外链，自动加上外部链接图标。

## NavLink

包装后的 umi `NavLink`，可渲染外链，自动加上外部链接图标。

## AnchorLink

包装后的 umi `NavLink`，用于带锚点的链接，且可高亮。

## useCodeSandbox

- **参数：** 
  - opts：`Object`。主题 `Previewer` 组件接收到的 props
  - api：`String`。CodeSandbox创建 demo 时调用的API地址，默认值为`https://codesandbox.io/api/v1/sandboxes/define`
- **返回：** `Function`。在 CodeSandbox.io 打开 demo 的执行函数

根据 `Previewer` 的 props 生成一个函数，执行后可在 [codesandbox.io](https://codesandbox.io) 打开该 demo，例如：

```jsx | pure
// builtins/Previewer.tsx
import React from 'react';
import { useCodeSandbox } from 'dumi/theme';

export default props => {
  const openCSB = useCodeSandbox(props);

  return <button onClick={openCSB}>点我会在 CodeSandbox.io 上打开 demo</button>;
};
```

## useCopy

- **参数：** 无
- **返回：**
  - copyCode：`Function`。拷贝执行函数，执行时传入的文本会被拷贝到剪贴板
  - copyStatus：`'ready' | 'copied'`。默认值为 `ready`，在执行拷贝后会变成 `copied`，2s 后再变回 `ready`，便于开发者控制复制成功的提示信息

提供复制函数及复制的状态，便于实现源代码复制和状态展示，例如：

```jsx | pure
// builtins/Previewer.tsx
import React from 'react';
import { useCopy } from 'dumi/theme';

export default props => {
  const [copyCode, copyStatus] = useCopy();

  return <button onClick={() => copyCode('Hello')}>点我会复制文字</button>;
};
```

## useSearch

- **参数：** `String`。当前输入框的关键字
- **返回：**
  - `Function`。如果用户开启 algolia，则返回 algolia 的绑定函数，将输入框的 CSS 选择器传入即可，后续筛选、呈现工作全部交给 algolia
  - `Array`。如果用户未开启 algolia，则返回基于关键字的内置搜索结果，目前只能搜索标题

根据配置自动提供 algolia 的绑定函数或者根据关键字返回内置搜索的检索结果，具体用法可参考 dumi 内置主题的 [SearchBar 组件](https://github.com/umijs/dumi/blob/master/packages/theme-default/src/components/SearchBar.tsx#L9)。

## useLocaleProps

- **参数：**
  - locale：`String`。当前 locale 值
  - props：`Object`。需要过滤、转换的 props
- **返回：** `Object`。过滤、转换之后的 props

根据 locale 自动过滤、转换 props，便于实现国际化 FrontMatter 的定义，比如 `title.zh-CN` 在中文语言下会被转换为 `title`，具体示例可参考 dumi 内置主题的 [Previewer 组件](https://github.com/umijs/dumi/blob/master/packages/theme-default/src/builtins/Previewer.tsx#L72)。

## useDemoUrl

- **参数：** `String`。主题 `Previewer` 组件接收到的 `identifier` 参数，demo 的唯一标识符
- **返回：** `String`。demo 单独打开的页面地址

获取单独打开 demo 的页面地址，例如 `useDemoUrl(props.identifier)` 会返回类似 `http://example.com/~demos/demo-id` 的 URL。

## useApiData

- **参数：** `String`。主题 `API` 组件接收到的 `identifier` 参数，API 的唯一标识符
- **返回：** `Array`。Props 属性列表

获取指定组件的 API 元数据，可参考 dumi 默认主题的 [API 组件实现](https://github.com/umijs/dumi/blob/master/packages/theme-default/src/builtins/API.tsx)。

## useTSPlaygroundUrl

- **参数：**
  - locale：`String`。当前的语言选项
  - code：`String`。要在 TypeScript Playground 中转换的 TSX 代码
- **返回：** `String`。前往 TypeScript Playground 的 url

获取当前 TypeScript 官网 Playground 的链接，用于将 TSX 代码提交到 Playground 中展示 JSX 代码。

## usePrefersColor

- **参数：** 无
- **返回：**
  - color: `'light' | 'dark' | 'auto'`。当前的 color 值
  - setColor: `(color: 'light' | 'dark' | 'auto') => void`。设置当前 color 的函数，设置为 `auto` 时意味着跟随操作系统的偏好设置

当我们需要为主题增加暗黑/明亮模式的切换能力时，需要用到该 API。

对于开发者而言：

- 可以通过 `[data-prefers-color=dark]` 的属性选择器，在主题 Less 中增量编写暗黑模式的样式，例如

```less
.navbar { /* 明亮样式 */ }
[data-prefers-color=dark] .navbar { /* 暗黑样式 */ }

// 或者
.navbar {
  /* 明亮样式 */
  [data-prefers-color=dark] & {
    /* 暗黑样式 */
  }
}
```

- 可以通过该 hook，可以拿到当前色彩偏好的值以及切换函数，以便为用户提供开关来切换暗黑/明亮模式，例如：

```tsx | pure
import React from 'react';
import { usePrefersColor } from 'dumi/theme';

export default props => {
  const [color, setColor] = usePrefersColor();

  return (
    <>
      <button onClick={() => setColor('auto')}>启用自动主题色</button>
      当前主题色配置为：{color}
    </>
  );
};
```

更多信息可参考 [#543](https://github.com/umijs/dumi/pull/543)。
