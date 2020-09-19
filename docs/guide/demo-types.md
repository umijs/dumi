---
group:
  title: Start to develop demo
---

# Types of demos

There are three types for demo in dumi

## Code block

dumi render the code block with `jsx` and `tsx` as React Component. This code block, as same as common module, needs to have `export default` like this:

<pre lang="md">
```jsx
import React from 'react';

export default () => <h1 style={{ color: '#555' }}>Hello World!</h1>;
```
</pre>

It rendered by dumi like:

```jsx
import React from 'react';

export default () => <h1 style={{ color: '#555' }}>Hello World!</h1>;
```

Of course, if you don't want dumi to render code block at all, or want to render other code block languages as React Component, you can configurate [`config.resolve.previewLangs`](/config#previewlangs)

## External import

For being able to easy to code and maintain complex demo, dumi supports to render a React Component as demo from external, only need to use the `code` tag to achieve:

```html
<code src="/path/to/Demo.tsx" />
```

## Embedded mode

Strictly speaking, this is a presentation rather than a demo type. Sometimes we want to present a demo to users directly instead of being wrapped in a demo container, like this:

```jsx | inline
import React from 'react';

export default () => <h1 style={{ color: '#555' }}>Hello World!</h1>;
```

It can be found that it is completely an embeded mode presentation of the demo above, which also means that we can insert any required components into the document page through the embedded mode demo, breaking away from the limitation of dumi's native theme ability.

Both of the above two demos can become embedded mode. You only need to use the `inline` attribute to control it

<pre lang="md">
// code block type in embedded mode
```jsx | inline
import React from 'react';

export default () => <h1 style={{ color: '#555' }}>Hello World!</h1>;
```
</pre>

```jsx | pure
/* external demo in embedded mode */
<code src="/path/to/Demo.tsx" inline />
```
