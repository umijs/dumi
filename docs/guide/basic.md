---
title: Basic
order: 2
toc: menu
---

## Directory Structure

### Common project

The directory structure of a common component library that based on dumi is roughly as follows:

<Tree>
  <ul>
    <li>
      docs
      <small>Component library document directory</small>
      <ul>
        <li>
          index.md
          <small>Documentation Home (If it does not exist, it will fallback to README.md)</small>
        </li>
        <li>
          guide
          <small>Component library document other routing (Signal)</small>
          <ul>
            <li>index.md</li>
            <li>sample.md</li>
            <li>help.md</li>
          </ul>
        </li>
      </ul>
    </li>
    <li>
      src
      <small>Source code directory</small>
      <ul>
        <li>
          Button
          <small>Single component</small>
          <ul>
            <li>
              index.tsx
              <small>Single component</small>
            </li>
            <li>
              index.less
              <small>Component style</small>
            </li>
            <li>
              index.md
              <small>Component documentation</small>
            </li>
          </ul>
        </li>
        <li>
          index.ts
          <small>Component library entry file</small>
        </li>
      </ul>
    </li>
    <li>
      .umirc.ts
      <small>dumi configuration file (Can also be config/config.ts)</small>
    </li>
    <li>
      .fatherrc.ts
      <small>father-build configuration file, used for component library packaging</small>
    </li>
  </ul>
</Tree>

If it is a pure document site without component source code, just ignore the `src` directory above.

Note that only the directory structure is explained here.

If you want to initialize a dumi project, it is recommended to directly use the scaffolding of `@umijs/create-dumi-lib` or `@umijs/create-dumi-app` to create it.

### lerna project

In most cases, we will gather the documentation of all lerna sub-packages in the same documentation site.

The directory structure is usually like this:

<Tree>
  <ul>
    <li>
      docs
      <small>Public documents</small>
      <ul>
        <li>
          index.md
          <small>Documentation Home (If it does not exist, it will fallback to README.md)</small>
        </li>
        <li>
          guide
          <small>Component library document other routing (Signal)</small>
          <ul>
            <li>index.md</li>
            <li>sample.md</li>
            <li>help.md</li>
          </ul>
        </li>
      </ul>
    </li>
    <li>
      packages
      <ul>
        <li>
          a
          <small>Subpackage a</small>
          <ul>
            <li>
              src
              <small>Source directory of subpackage a</small>
              <ul>
                <li>
                  Button
                  <small>Single component</small>
                  <ul>
                    <li>
                      index.tsx
                      <small>Source code</small>
                    </li>
                    <li>
                      index.less
                      <small>Component style</small>
                    </li>
                    <li>
                      index.md
                      <small>Component documentation</small>
                    </li>
                  </ul>
                </li>
                <li>
                  index.ts
                  <small>Component library entry file</small>
                </li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          b
          <small>Subpackage b</small>
          <ul>
            <li>
              src
              <small>Source directory of subpackage b</small>
              <ul>
                <li>
                  Table
                  <small>Single component</small>
                  <ul>
                    <li>
                      index.tsx
                      <small>Source code</small>
                    </li>
                    <li>
                      index.less
                      <small>Component style</small>
                    </li>
                    <li>
                      index.md
                      <small>Component documentation</small>
                    </li>
                  </ul>
                </li>
                <li>
                  index.ts
                  <small>Component library entry file</small>
                </li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
    </li>
    <li>
      .umirc.ts
      <small>dumi configuration file (Can also be config/config.ts)</small>
    </li>
    <li>
      .fatherrc.ts
      <small>father-build configuration file, used for component library packaging</small>
    </li>
  </ul>
</Tree>

By default, dumi will search for the Markdown documents of all sub-packages and generate routes based on the path `packages/[package name]/src`.

There is currently no scaffolding for the lerna project. You can check [ahooks](https://github.com/alibaba/hooks) project as a reference.

## Conventional routing

As shown in the figure below, dumi's conventional routing rules are very simple:

<img src="https://gw.alipayobjects.com/zos/bmw-prod/66ca1c57-3146-40d5-bea4-24dea86eb95b/kijoyzad_w1540_h732.png" width="770" />

Give a few examples to facilitate understanding:

| Disk path/mode | doc mode | site mode |
| --- | --- | --- |
| /path/to/src/index.md | - group: none<br >- page routing: / | - navigate: none<br >- group: none<br>- page routing: / |
| /path/to/src/hello.md | - group: none<br >- page routing: /hello | - navigate: /hello<br >- group: /hello<br>- page routing: /hello |
| /path/to/src/hello/index.md | - group: /hello<br >- page routing: /hello | - navigate: /hello<br >- group: /hello<br>- page routing: /hello |
| /path/to/src/hello/world.md | - group: /hello<br >- page routing: /hello/world | - navigate: /hello<br >- group: /hello<br>- page routing: /hello/world |
| /path/to/src/hello/world/dumi.md | - group: /hello/world<br >- page routing: /hello/world/dumi | - navigate: /hello<br >- group: /hello/world<br>- page routing: /hello/world/dumi |

It should be noted that the routes generated by files with the same disk path under multiple base paths will conflict with each other.

Which means that only one of `docs/index.md` and `src/index.md` will be recognized in the default configuration.

### Customize navigation, grouping and titles

If you want to control the generation of navigation/grouping/titles, you can control it by **writing FrontMatter at the top of the Markdown file**:

```markdown
---
title: Custom page name
nav:
  path: /Custom navigation route
  title: Custom navigation name
  order: Control the navigation order, the smaller the number, the higher the order, the default is to sort by path length and dictionary order
group:
  path: /Custom group routing, note that group routing = navigation routing + yourself
  title: Custom group name
  order: Control the grouping order, the smaller the number, the higher the order, the default is to sort by path length and dictionary order
---

<!-- Other Markdown content -->
```

In site mode, we can also incrementally customize the navigation and left menu through configuration items.

Please refer to [Configuration Item-navs]() and [Configuration Item-menus]().

## Write component demo

dumi provides two ways to write demos to deal with different scenarios.

### Code block

If our demo is very lightweight, it is recommended to write code blocks directly, such as:

<pre lang="markdown">
```jsx
import React from 'react';

export default () => <h1>Hello dumi!</h1>;
```
</pre>

The code blocks of `jsx` and `tsx` will be parsed as React components by dumi, and the above code blocks will be rendered as:

```jsx
import React from 'react';

export default () => <h1>Hello dumi!</h1>;
```

Writing code in the markdown is yet not so smooth and easy as in `tsx` due to the absence of type suggestion, and thus we recommend using the [TS in Markdown Visual Studio extension](https://github.com/Dali-Team/vscode-ts-in-markdown).

#### Using component in demo

dumi has a very important principle: **developers should use components like users**.

How to explain? If we are developing a library called `hello-dumi`, and we are wrting a demo for `Button` component in it, the following are examples of the correct way and errors:

```jsx | pure
// Correct
import { Button } from 'hello-dumi';

// Error, user does not know how to get Button component
import Button from './index.tsx';
import Button from '@/Button/index.tsx';
```

It means that the demos we write can not only be used to debug components and write documents, but can also be copied directly to the project by users.

You may have question, how it works before the source code was released as an npm package? Do not worry, dumi will create an alias for us between library NPM package and library source code, it also works for all sub-packages in lerna project.

#### Render as source code

If we want a block of `jsx`/`tsx` code to be rendered as source code, we can use the `pure` modifier to tell dumi:

<pre lang="markdown">
```jsx | pure
// I will not be rendered as a React component
```
</pre>

Also, we can use the `preview` modifier with [Configuration Item-resolve.passivePreview](/config#passivepreview) to render a part of `jsx`/`tsx` codeblocks as React components, not all of them. This approach is used to avoid to add many `pure` modifiers to most of `jsx`/`tsx` codeblocks.

<pre lang="markdown">
```jsx | preview
// I will be rendered as a React component
```

```jsx
// I will be rendered as a React component by default
// I will not be rendered as React component in the passive preview mode
```
</pre>

### External demo

If our demo is very complicated and may even have many external files, then it is recommended to use an external demo:

```markdown
<code src="/path/to/complex-demo.tsx"></code>
```

Like the code block demo, the above code will also be rendered as a react component.

And the source code of the external demo and other dependent source codes can be viewed by users, like this:

<code src="../.demos/modal/modal.jsx"></code>

### Control demo rendering

dumi provides some FrontMatter properties to meet different demo rendering requirements, just configure it at the top of the source code:

<pre lang="markdown">
```jsx
/**
 * [Configuration item name]: [value]
 */
```
</pre>

For the external demo, these FrontMatter attributes can be written in the source code, but also on the attributes of the `code` tag:

```html
<code src="/path/to/demo" ConfigurationItem="value"></code>
```

dumi currently supports the following demo control capabilities.

#### Capture the `fixed` element

Set `transform` to `true` to position the internal `position: fixed;` element relative to the Demo wrapper:

```jsx
/**
 * transform: true
 * defaultShowCode: true
 */
/**
 * transform: true
 */

import React from 'react';

export default () => <h1 style={{ position: 'fixed', top: 0, left: 0 }}>It won't fly out</h1>;
```

#### Modify the background color

Through the `background` configuration item, you can modify its background color, gradient and even add a background image.

Dumi will treat it as a CSS property value. For example, configure `background` to `'#f6f7f9'`:

```jsx
/**
 * background: '#f6f7f9'
 * defaultShowCode: true
 */
/**
 * background: '#f6f7f9'
 */

import React from 'react';

export default () => null;
```

#### No padding required

Configure `compact` to `true`, all padding will be removed:

```jsx
/**
 * compact: true
 * defaultShowCode: true
 */
/**
 * compact: true
 */

import React from 'react';

export default () => 'It will welt';
```

#### Title and introduction

Configure the title and introduction of the demo through `title` and `desc`:

```jsx
/**
 * title: I am the title
 * desc: I’m a profile, I can use `Markdown` to write
 * defaultShowCode: true
 */
/**
 * title: I am the title
 * desc: I’m a profile, I can use `Markdown` to write
 */

import React from 'react';

export default () => null;
```

#### Embed the document directly

Configure `inline` to `true`, the wrapper will not be displayed, and the demo will be embedded directly in the document:

<pre lang="markdown">
```jsx
/**
 * inline: true
 */

import React from 'react';

export default () => 'It will be directly embedded';
```
</pre>

Like this:

```jsx
/**
 * inline: true
 */

import React from 'react';

export default () => 'It will be directly embedded';
```

#### Debug demo

Set `debug` to true, the demo will only be displayed in the development environment, and there will be a special mark:

```jsx
/**
 * inline: true
 */
import React from 'react';
import Previewer from 'dumi-theme-default/src/builtins/Previewer';

export default () => (
  <Previewer
    sources={{
      _: {
        jsx:
          "/**\n * debug: true\n */\n\nimport React from 'react';\n\nexport default () => 'I only show in the development environment';",
      },
    }}
    dependencies={{}}
    debug
    defaultShowCode
  >
    I only show in the development environment
  </Previewer>
);
```

#### iframe mode

Setting `iframe` to `true` will use `iframe` to render the demo, which can be completely isolated from the document.

It is usually used for layout components. In this case, [`compact`](/config/frontmatter#compact) The configuration defaults to `true`:

```jsx
/**
 * iframe: 150
 * defaultShowCode: true
 */
/**
 * iframe: true // Set to a numeric value to control the height of the iframe
 */
import React from 'react';

export default () => (
  <h2 style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.1)', padding: '5px 20px' }}>iframe mode</h2>
);
```

## Use built-in components

dumi provides a series of built-in components as a supplement to Markdown syntax.

In addition to the `code` we have used above, it also supports these:

### Alert

Use `Alert` to create an alert box, `type` can be `warning`, `info`, `success`, `error`, and the default is `info`.

```html
<Alert type="info">
  Note: only HTML can be written internally for now
</Alert>
```

<Alert type="info">
  Note: only HTML can be written internally for now
</Alert>

### Badge

Use `Badge` to create a label:

```markdown
#### Badge test <Badge>Hello</Badge>
```

#### Badge test <Badge>Hello</Badge>

### embed

dumi has extended the HTML default `embed` tag to embed the content of another Markdown document in a Markdown document:

```html
<!-- Introduce the full content of Markdown files -->
<embed src="/path/to/some.md"></embed>

<!-- Introduce the Markdown file content of the specified line according to the line number -->
<embed src="/path/to/some.md#L1"></embed>

<!-- Introduce part of the Markdown file content based on the line number -->
<embed src="/path/to/some.md#L1-L10"></embed>

<!-- Introduce part of the Markdown file content based on the regular expression -->
<embed src="/path/to/some.md#RE-/^[^\r\n]+/"></embed>
```

We can also use the theme API provided by dumi to replicate and add built-in components. Visit [Theme-Theme Development](/theme/development) to learn more.
