```jsx | pure
import React from 'react';

export default () => <h1>Hello World!</h1>;
```

```tsx
/**
 * title: test
 * title.zh-CN: 测试
 * desc: test css in dependencies，[Link](https://d.umijs.org)
 * desc.zh-CN: 测试依赖中的 CSS，[链接](https://d.umijs.org)
 */
import React from 'react';
import katex from 'katex';

export default () => <h1>Hello {typeof katex}!</h1>;
```

```tsx
/**
 * identifier: custom-demo-url
 * description: |
 *   多行文本测试
 *   - 列表
 */
import React from 'react';

export default () => null;
```

<code src="./demo-missing-react.tsx" hideActions='["CSB"]' defaultShowCode />

<code src="./demo-missing-react.tsx" inline />

```jsx
/**
 * debug: true
 */
export default () => null;
```

<code src="./demo-missing-react.tsx" debug />

<code
  src="./demo-missing-react.tsx"
/>

<code
  src="./demo-missing-react.tsx"
/>123

000<code
  src="./demo-missing-react.tsx"
/>456<code
  src="./demo-missing-react.tsx"
/>