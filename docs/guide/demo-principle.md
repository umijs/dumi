---
group:
  title: Start to develop demo
---

# Ideals of demos

Dumi has only one ideal, **developer should write demos like user**

How to understand this? The user's demo is actual project. Writting demo from the perspective of users means that demos can directly used in actual project, therefore, it must have following principles.

## Principle one: enable to view & use

While we are writting a demo for component, it's usual to write like this:

```jsx | pure
import React from 'react';
import Component from './'; // Wrong: do not imitate

export default () => <Component />;
```

Obviously, this demo can run as expected, but if user found that this demo could used for developing the project and when user prepared to copy source code into the project, he/she would find that it couldn't recognize the dependence about `./` compeletely. So, some demos like this, **only enable to view but disable to use**.

For dealing with this embarrassed problem, dumi uses alias for current project's package automatically for developer, By the way, dumi uses aliases for all packages if project is based on lerna. It means we could reference dependencies of libraries, like this:

```jsx | pure
import { Component } from 'library-name';
```

Such demo, not only could be used in project directly, but also works while opening in codesandbox.io

## Principle two: clear dependencies

Since umi helps us to import React automatically, it can works well even we don't import React in JSX.

```jsx | pure
export default () => <>Hello World</>; // It works
```

But such demos don't work in online editor or other non-umi framework projects. So, we assume such demos have unclear dependencies. We should import React as long as we use in JSX.

```jsx | pure
import React from 'react';

export default () => <>Hello World</>; // It works too
```

## Principle three: easy to maintained

Will user write projects in Markdown? Absolutely no. The reason why we directly write demos in Markdown is simple and convenience in this way. But if there was a complex demo, and we were determined to write in Markdown. It would be a nightmare when writting and maintaining, same as we still have to use Windows Notepad to code in 2020.

In order to letting developers to code and maintain demos as same as developing components, dumi support to import demo from external, something like this:

```html
<code src="/path/to/Demo.tsx" />
```

Meanwhile, for enabling demos to view and use, dumi will show origin source code which needed to show to user! This not only doesn't affect experiences of user, but also makes developers to enjoy the powerful functions such as Code Snipperts, ESLint, prettier and so on brought by the editor.


If a demo coded by developer didn't work with directly coping, the demo is able to『view, but not to use』.If developers coded demos from the perspective of users, the demo must be able to 『view and use』
