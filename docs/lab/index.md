---
nav:
  title: Lab
  order: 5
sidemenu: false
---

<Alert>
The experimental functions are unstable, please do not use it in production. If you have any suggestions, welcome to feedback and exchanges in the discussion group ❤
</Alert>

## Motions

It can be understood as a Demo action. If the developer writes motions in advanced when writing a Demo, for example, write it like this:

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
        add
      </button>
      <button
        type="button"
        data-action="reset"
        onClick={() => setCount(0)}
        style={{ marginLeft: 8, color: '#000' }}
      >
        reset
      </button>
    </>
  );
};
```

You will get the following Demo, try to click the play button on the operation bar, the motions predefined by developer will be executed in sequence:

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
        add
      </button>
      <button
        type="button"
        data-action="reset"
        onClick={() => setCount(0)}
        style={{ marginLeft: 8, color: '#000' }}
      >
        reset
      </button>
    </>
  );
};
```

Currently supports the following motion syntax:

- `autoplay`: The motion will be executed automatically in the first place, and loop will be supported in the future
- `click:selector`: Following the colon is a CSS selector, which is used to click on a selector
- `timeout:number`: Following the colon is a number, which is used to wait for a certain time before executing the next step, such as waiting for the transition animation to complete
- `capture:selector`: Following the colon is a CSS selector, which is used for `postMessage`. This selector can be extended in the future in combination with snapshots and other scenarios. The content of the message data sent is:
  ```js
  { type: 'dumi:capture-element', value: 'selector' }
  ```
