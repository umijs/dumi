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

console.log(katex);

export default () => <h1>Hello World!</h1>;
```

<code src="./demo-missing-react.tsx" hideActions='["CSB"]' />