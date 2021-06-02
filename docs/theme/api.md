---
order: 3
toc: menu
---

# Theme API

In order to customize the theme, dumi provides a set of theme API, we can import the following from `dumi/theme`.

## context

You can get the configuration items of dumi, meta information of the current routing, international language options, etc.

The detailed definition of context can be <a target="_blank" href="https://github.com/umijs/dumi/blob/master/packages/preset-dumi/src/theme/context.ts#L8">View source code</a>.

## Link

The packaged umi `Link` can render external links and automatically add external link icons.

## NavLink

The packaged umi `NavLink` can render external links and automatically add external link icons.

## AnchorLink

The packaged umi `NavLink` is used for links with anchor points and can be highlighted.

## useCodeSandbox

- **props:**
  - opts `Object`. The props received by the theme `Previewer` component.
  - api `String`. The api that CodeSandbox calls when creating the demo, the default value is `https://codesandbox.io/api/v1/sandboxes/define`.
- **return:** `Function`. Open the execution function of the demo in CodeSandbox.io

Generate a function based on the props of `Previewer`, and open the demo in [codesandbox.io](https://codesandbox.io) after execution, for example:

```jsx | pure
// builtins/Previewer.tsx
import React from 'react';
import { useCodeSandbox } from 'dumi/theme';

export default props => {
  const openCSB = useCodeSandbox(props);

  return <button onClick={openCSB}>Click will open the demo on CodeSandbox.io</button>;
};
```

## useCopy

- **props:** none
- **return:**
  - copyCode: `Function`. Copy the execution function, the text passed in during execution will be copied to the clipboard
  - copyStatus: `'ready' |'copied'`. The default value is `ready`, it will become `copied` after the copy is executed, and then return to `ready` after 2s, which is convenient for developers to control the prompt message of successful copy

Provide copy function and copy status to facilitate source code copy and status display, for example:

```jsx | pure
// builtins/Previewer.tsx
import React from 'react';
import { useCopy } from 'dumi/theme';

export default props => {
  const [copyCode, copyStatus] = useCopy();

  return <button onClick={() => copyCode('Hello')}>Click will copy text</button>;
};
```

## useSearch

- **props:** `String`. The keyword of the current input box
- **return:**
  - `Function`. If the user opens algolia, it will return to the binding function of algolia, and just pass in the CSS selector of the input box, and all subsequent filtering and rendering work will be handed over to algolia
  - `Array`. If the user does not open algolia, it will return the keyword-based built-in search results, currently only the title can be searched

According to the configuration, automatically provide algolia's binding function or return the search results of the built-in search according to the keyword.

For specific usage, please refer to the [SearchBar component](https://github.com/umijs/dumi/blob/master/packages/theme-default/src/components/SearchBar.tsx#L9) of dumi built-in themes.

## useLocaleProps

- **props:**
  - locale：`String`. Current locale value
  - props：`Object`. Props that need to be filtered and converted
- **return:** `Object`. Props after filtering and transformation

Automatically filter and convert props according to locale to facilitate the realization of the internationalization of FrontMatter definitions. For example, `title.zh-CN` will be converted to `title` in Chinese language.

For specific usage, please refer to the [Previewer component](https://github.com/umijs/dumi/blob/master/packages/theme-default/src/builtins/Previewer.tsx#L72) of dumi built-in themes.

## useDemoUrl

- **props:** `String`. The `identifier` parameter received by the theme `Previewer` component, the unique identifier of the demo
- **return:** `String`. The address of the demo page opened separately

Get the URL of the page that opened the demo separately. For example, `useDemoUrl(props.identifier)` will return a URL similar to `http://example.com/~demos/demo-id`.

## useApiData

- **props:** `String`. The `identifier` parameter received by the subject `API` component, the unique identifier of the API
- **return:** `Array`. Props property list

To get the API metadata of the specified component, please refer to the [API component implementation](https://github.com/umijs/dumi/blob/master/packages/theme-default/src/builtins/API.tsx) of the dumi default theme.

## useTSPlaygroundUrl

- **props:**
  - locale：`String`. Current language options
  - code：`String`. The TSX code to be converted in TypeScript Playground
- **return:** `String`. The url go to TypeScript Playground

Get the link to the Playground of the current TypeScript official website to submit the TSX code to the Playground to display the JSX code.

## usePrefersColor

- **props:** none
- **return:**
  - color: `'light' | 'dark' | 'auto'`. Current prefers color
  - toggleColor: `(color: 'light' | 'dark' | 'auto') => void`. A function to change current prefers color for site, the prefers color will follow OS preferences if set `auto`

This API will be useful if we want to implement dark/light mode for our theme.

For theme developer:

- Can write dark mode styles incrementally with `[data-prefers-color=dark]` CSS attribute selector, for example:

```less
.navbar { /* light styles */ }
[data-prefers-color=dark] .navbar { /* dark styles */ }

// or
.navbar {
  /* light styles */
  [data-prefers-color=dark] & {
    /* dark styles */
  }
}
```

- Get current prefers color & toggle function via this react hook, to provide a button to toggle dark/light mode for user, for example:

```tsx | pure
import React from 'react';
import { usePrefersColor } from 'dumi/theme';

export default props => {
  const [color, setColor] = usePrefersColor();

  return (
    <>
      <button onClick={() => setColor('auto')}>Enable auto prefers color</button>
      Current prefers color: {color}
    </>
  );
};
```

More informations in [#543](https://github.com/umijs/dumi/pull/543)。
