# Demo Principle

From the beginning of dumi, there was an important principle for writing demo: **developer should write demos like a user**.

Like a user, it refers to "developer use components in demos, in the same way as users use componets in their projects". That is to say, developer's demos can also be used in user's project.

The demo principle includes 3 rules.

## Rule 1: Can be previewd and used

When we import the component in the demo, It is likely to be written as:

```jsx | pure
// Error example
import Button from './index.tsx';
import Button from '@/Button/index.tsx';
```

Although it works fine in the document, but the user does not know how to import the component in his project when viewing the document. So the demos like this **can only be previewed but not used**.

In order to solve this problem, dumi will automatically help developers to establish the mapping relationship between component library NPM package -> component library source code, so that we can import components like users:

```jsx | pure
// Correct example
// Note: It is assumed that the name in package.json is hello-dumi
import { Button } from 'hello-dumi';
```

## Rule 2: Clear dependencies

The [Umi](https://umijs.org) users may know, the import statement of `React` in not required when writing JSX in Umi project, but in component development, in order to ensure that the demo we write can works with any development framework and any React version (React 17's JSX conversion support does not introduce React), demo dependencies must be clear enough, so the import statement of `React` is necessary:

```jsx | pure
import React from 'react';

export default () => <>Hello World</>;
```

## Rule 3: Easy to maintain

Will users coding in Markdown? Obviously not. Developers choose to write demo directly in Markdown because it is simple and convenient, but if a component's demo is particularly complicated, we insist on writing it in Markdown, and the process of writing and maintaining it becomes a nightmare.

In order to allow developers to write and maintain demos in the same way as development components, dumi supports to embed a demo from other file, like this:

```html
<code src="/path/to/Demo.tsx"></code>
```

At the same time, in order to make it can be previewed and used, dumi will still show the real source code to the user when the user needs to show the source code of the demo! In this way, not only the user experience is not affected at all, but developers can also enjoy the powerful functions of the editor such as Code Snippets, ESLint, and prettier.

If you have your own thoughts on the preparation of component demo, welcome to [dumi project discussion](https://github.com/umijs/dumi/discussions) to share your experience.
