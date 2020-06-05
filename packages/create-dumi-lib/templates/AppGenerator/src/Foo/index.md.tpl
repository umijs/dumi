{{ #siteMode }}
---
nav:
  title: Components
  path: /components
---
{{ /siteMode }}

## Foo

Demo:

```tsx
import React from 'react';
import { Foo } from '{{{ packageName }}}';

export default () => <Foo title="First Demo" />;
```

More skills for writing demo: https://d.umijs.org/guide/demo-principle
