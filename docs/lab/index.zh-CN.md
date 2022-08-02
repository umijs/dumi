---
nav:
  title: 实验室
  order: 5
sidemenu: false
---

<Alert>
实验性质的功能可能不稳定，请谨慎用于生产；如果体验后有任何建议，欢迎在讨论群中进行反馈和交流 ❤
</Alert>

## Motions

中文名还没想好，可以理解为 Demo 动作，开发者如果在编写 Demo 的时候预先写好 `motions`，比如这么写：

```tsx | pure
/**
 * motions:
 *  - click:[data-action="addon"]
 *  - timeout:1000
 *  - click:[data-action="addon"]
 *  - timeout:1000
 *  - click:[data-action="reset"]
 */
import React, { useState } from 'react';

export default () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <p>{count}</p>
      <button type="button" style={{ color: '#000' }} data-action="addon" onClick={() => setCount(count + 1)}>
        增加
      </button>
      <button
        type="button"
        data-action="reset"
        onClick={() => setCount(0)}
        style={{ marginLeft: 8, color: '#000' }}
      >
        重置
      </button>
    </>
  );
};
```

将会得到如下 Demo，尝试点击操作栏上的播放按钮，开发者预先定义好的 `motions` 将会依次执行：

```tsx
/**
 * motions:
 *  - click:[data-action="addon"]
 *  - timeout:1000
 *  - click:[data-action="addon"]
 *  - timeout:1000
 *  - click:[data-action="reset"]
 */
import React, { useState } from 'react';

export default () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <p>{count}</p>
      <button type="button" style={{ color: '#000' }} data-action="addon" onClick={() => setCount(count + 1)}>
        增加
      </button>
      <button
        type="button"
        data-action="reset"
        onClick={() => setCount(0)}
        style={{ marginLeft: 8, color: '#000' }}
      >
        重置
      </button>
    </>
  );
};
```

目前支持如下 `motion` 语法：

- `autoplay`: 在首位时该 motion 将会自动执行，未来会再支持 `loop` 以实现循环播放
- `click:selector`: 冒号后面跟随的是 CSS 选择器，用于点击某个选择器
- `timeout:number`: 冒号后面跟随的是数字，用于等待一定时间再执行下一步，比如等待过渡动画完成
- `capture:selector`: 冒号后面跟随的是 CSS 选择器，用于 `postMessage` 该选择器，可在未来结合 snapshot 等场景进行扩展，发出的 message data 内容为：
  ```js
  { type: 'dumi:capture-element', value: 'selector' }
  ```
