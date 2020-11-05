# Render of demos

The render of demo is controlled by dumi's built-in `Previewer`. This component exports some `props`, so that we can configurate through FrontMatter, for example:

<pre>
```jsx
/**
 * title: title
 */

// content
```
</pre>

Dumi will remove FrontMatter from the source code and will not present it to users. If it is an external imported demo, we can not only configurate FrontMatter in the external demo file as above, but also can directly transfer `props` to the `code` tag:

```html
<code src="/path/to/Demo.tsx" title="title" />
```

At present, the built-in `Previewer` component provides control configurations for the following scenarios.

## `fixed` Element

If our demo contains elements which have the `position: fixed` property, it must 『overflow』 of the demo wrapper when rendering. However, in some scenarios, we still want it to be positioned relative to the demo wrapper. Therefore, the `Previewer` provides a configuration item of `transform`. Once set it to true, the `transform` property will be set in the demo wrapper to change the CSS containing block of the `position: fixed` element to demo wrapper, like this:

<pre>
```jsx
/**
 * transform: true
 */

// content
```
</pre>

## Background

The background color of the demo wrapper is white by default, but there are some demos need a dark background.You can change its background color, background gradient, or even add a background image by changing the configuration item of `background`. The `previewer` will consider it as a CSS property:

<pre>
```jsx
/**
 * background: '#f6f7f9'
 */

import React from 'react';

export default () => null;
```
</pre>

like this:

```jsx
/**
 * background: '#f6f7f9'
 */

import React from 'react';

export default () => null;
```

## No Padding

In order to present the art of blank, the demo wrapper has `padding` by default to ensure that the demo will not be presented on the edge; however, for some demos, we want it to be presented on the edge, such as navigation, sidebar, etc. Dumi provides a configuration item of `compact` to control the paddings. Once set it to `true`, all paddings will be removed

<pre>
```jsx
/**
 * compact: true
 */

import React from 'react';

export default () => 'I\'ll on the edge';
```
</pre>

like this:

```jsx
/**
 * compact: true
 */

import React from 'react';

export default () => "I'll on the edge";
```

## Title & Desc

If we want to add some informations, such as title and description, to the demo, we can configure it by `title` and `desc`:

<pre>
```jsx
/**
 * title: Here is title
 * desc: Here is description, could coded in `Markdown`
 */

import React from 'react';

export default () => null;
```
</pre>

Like this：

```jsx
/**
 * title: Here is title
 * desc: Here is description, could coded in `Markdown`
 */

import React from 'react';

export default () => null;
```

## Embeded in documents

Render demo in embedded mode, please refer to [The Types of demos - embedded mode](/guide/demo-types#embedded-mode)。

## debug demo <Badge>1.1.0-beta.30+</Badge>

If we just want to render some demos in development mode for debug, we can use the `debug` option, details: [FrontMatter - debug](/config/frontmatter#debug)

## iframe mode <Badge>1.1.0-beta.30+</Badge>

If we want to render demo in an iframe element, we can use `iframe` option to implement absolute isolation between demo and docs, it is usually used for layout component:

<pre lang="md">
```jsx
/**
 * iframe: true
 * iframe: 300 // control iframe height via number value
 */
import React from 'react';

export default () => (
  <h2
    style={{
      boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
      padding: '5px 20px'
    }}
  >
    iframe mode
  </h2>
);
```
</pre>

Like this：

```jsx
/**
 * iframe: 150
 */
import React from 'react';

export default () => (
  <h2 style={{ boxShadow: '0 2px 15px rgba(0,0,0,0.1)', padding: '5px 20px' }}>iframe mode</h2>
);
```
