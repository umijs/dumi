# Demo Principle

From the beginning of dumi, there was an important Demo writing philosophy: **Developers should write Demos like users**.

Like users, it refers to 『how future users of the component library will use the components in the project, and the developers themselves use the components in the demo』, which means that the demo written by the developer can be directly used by the user's project.

This can be divided into three principles.

## Principle 1: Can see and use

When we introduce the component in the Demo, it is easy to write it like this:

```jsx | pure
// Error example
import Button from './index.tsx';
import Button from '@/Button/index.tsx';
```

Although it can run normally in the component library document, the user does not know how to introduce the component in his project when viewing the document. Such a demo is **you can only watch it but not use it**.

In order to solve this problem, dumi will automatically help developers to establish the mapping relationship between component library NPM package -> component library source code, so that we can introduce components like users:

```jsx | pure
// Correct example
// Note: It is assumed that the name in package.json is hello-dumi
import { Button } from 'hello-dumi';
```

## Principle 2: Rely on clarity

Those who have developed projects using [Umi](https://umijs.org) may know that the introduction of `React` is not necessary when writing JSX; but in the component development scenario, in order to ensure that the Demo we write is copied to any front end The development framework and any React version (React 17's JSX conversion support does not introduce React) can run as expected. Demo dependencies must be clear enough, so the introduction of React is necessary:

```jsx | pure
import React from 'react';

export default () => <>Hello World</>;
```

## Principle 3: Easy to maintain

Will users write projects in Markdown? Obviously not. Developers choose to write Demo directly in Markdown because it is simple and convenient, but if a component's Demo is particularly complicated, we insist on writing it in Markdown, and the process of writing and maintaining it becomes a nightmare.

In order to allow developers to write and maintain demos in the same way as development components, dumi supports the introduction of a demo from the outside, like this:

```html
<code src="/path/to/Demo.tsx" />
```

At the same time, in order to make it visible and usable, dumi will still show the real source code to the user when the user needs to show the source code of the Demo! In this way, not only the user experience is not affected at all, but developers can also enjoy the powerful functions of the editor such as Code Snippets, ESLint, and prettier.

If you have your own thoughts on the preparation of component Demo, welcome to [dumi project discussion area](https://github.com/umijs/dumi/discussions) to share your experience.
