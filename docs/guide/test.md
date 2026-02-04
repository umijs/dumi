---
title: 单元测试
group: 进阶
order: 1
---

## 单元测试

单元测试简称单测。采用 Vitest + react-testing-library (RTL) 做为我们的测试框架。目录结构如下：

```text
tests
  setup.mjs  # 测试初始化脚本
src
  ComponentA
    index.tsx
    index.test.tsx # 建议和源文件放一起，好处是让新加入的成员能快速感知到 TDD 意识
...
```

### 环境准备

安装依赖：

```sh
npm install vitest jsdom @testing-library/react @testing-library/jest-dom --save-dev
```

新增文件 tests/setup.mjs，写入以下内容：

```js
// tests/setup.js
// @ts-check
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from "@testing-library/jest-dom/matchers";

expect.extend(matchers); // 对 expect 的能力增强，不用可注释

// 清屏：解决单个文件内多个 test 多次 render，后面的 render 会累积前面 render 产生的 DOM 节点问题
afterEach(() => {
  cleanup();
});

// 如果遇到 window.matchMedia undefined is not a function 可以开启
// window.matchMedia = vi.fn().mockImplementation((query) => ({
//   matches: false,
//   media: query,
//   onchange: null,
//   addListener: vi.fn(),
//   removeListener: vi.fn(),
// }))
```

新增 vitest.config.mjs 写入以下内容：

```js
// @ts-check
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // @ts-expect-error
  plugins: [react()],
  test: {
    setupFiles: './tests/setup.mjs',
    environment: 'jsdom',
    coverage: {
      thresholds: {
        branches: 20, // 自行设置合理值
        functions: 20,
        lines: 20,
      },
      include: ['src/'], // 只计算 src 内文件覆盖率
    },
  },

  resolve: {
    alias: [
      {
        find: '@',
        replacement: '/src', // 如果有设置 tsconfig.json paths 比如 `@`
      },
      {
        find: 'name-in-package.json', // 组件名，package.json 的 name。目的是文档测试
        replacement: '/src',
      },
    ],
  },
})
```

更新 package.json，新增以下 script：

```json
"test": "vitest",
"ci": "vitest run --coverage",
```

- `test`：本地写单测会用到，将 watch 单测和配置文件达到热更新的效果。
- `ci`：ci 流程会用到或在发布前进行自动化测试，此处会读取 vitest.config.mjs 中设置的 coverage 阈值，如果低于阈值 ci 将失败。

### 书写单测

下面结合例子来说明如何写一个单测。

比如有如下组件，我们想测试是否能正常展示 `Hello React`。

```tsx
// src/App.tsx
import * as React from 'react';

const title = 'Hello React';

function App() {
  return <div>{title}</div>;
}

export default App;
```

新增测试文件 `src/App.test.tsx`：

```tsx {9}
import * as React from 'react';
import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
  it('renders App component', () => {
    render(<App />);

    expect(screen.getByText('Hello React')).toBeDefined();
  });
});
```

再比如我们有一个登录组件，我们想测试在没有输入任何内容时，点击登录按钮会出现提示。

```tsx
expect(screen.queryByText('Please Enter Username / Email.')).toBeNull()
expect(screen.queryByText('Please Enter Password.')).toBeNull()

fireEvent.click(screen.getByRole('button'))

expect(screen.queryByText('Please Enter Username / Email.')).toBeDefined()
expect(screen.queryByText('Please Enter Password.')).toBeDefined()
```

> 注意我们此处用的是 `queryByText`，因为 `getByText` 找不到文本将报错。

更多示例以及关于 `get|queryByText` 等 API 使用和选择可以参考 <https://www.robinwieruch.de/react-testing-library/>。
此处不再详述。

#### 文档测试

如果我们能对 demo 进行单测，那该多好。相当于对用户契约有了自动化保障，类比 Rust 的 documentation test。
> Nothing is better than documentation with examples. But nothing is worse than examples that don't work because the code has changed since the documentation was written.
>
> 来自 <https://doc.rust-lang.org/book/ch14-02-publishing-to-crates-io.html#documentation-comments-as-tests>

“没有什么比带有示例的文档更好了。但是，没有什么比示例不起作用更糟糕了，因为自从编写文档以来，代码已经发生了变化。”

文档中的示例可以帮助理解，但需要确保示例的代码与文档一致，传统做法是定期检查代码与文档的匹配度。我们是否还有更好的手段？那就是**文档测试**。

针对 dumi 而言，文档测试是指我们在 markdown 中写的示例。还记得我们在 vitest.config.mjs 中配置的 alias 吗？

```js
{
  find: 'name-in-package.json', // 组件名，package.json 的 name。目的是文档测试
  replacement: '/src',
},
```

该配置是让示例代码中 `import { ComponentA } from 'name-in-package.json'` 能正确解析的关键。
举例说明，若我们有如下文档：

```md
// index.md
<code src="./demo/app.tsx"></code>
```

demo 内容为：

```tsx
// demo/app.tsx
import React from 'react'
import { ComponentA } from 'name-in-package.json'

export default () => {
  return <ComponentA ... />
}
```

在同目录 demo/ 下新增测试文件 demo/app.`test`.tsx：

```tsx
// demo/app.test.tsx
import * as React from 'react';
import { render, screen } from '@testing-library/react';

import Demo from './demo';

describe('Demo', () => {
  it('renders Demo component', () => {
    render(<Demo />);

    expect(screen.getByText('Hello React')).toBeDefined();
  });
});
```

至此我们已完成对一个组件的**单测**和**文档测试**，可以在该组件的 index.md 标题添加单测通过的 tag！

index.md：

```diff
- # ComponentA / 中文标题
+ # ComponentA / 中文标题 <Badge type="success">test passing</Badge>
```

当然也可以增加类似 npm 的 badge：

```text
[![dumi](https://img.shields.io/badge/test%20-passing-green)](https://github.com/umijs/dumi)
```
