---
order: 2
toc: menu
---

# Theme development

It is very easy to develop dumi themes.

To cope with different scenarios, dumi provides two theme development methods:

1. Create a `.dumi/theme` folder in the root directory of the dumi project, usually used for special customization in the project, regardless of reusability
2. Create an npm package starting with `@group/dumi-theme-` or `dumi-theme-`, which is usually used to develop a complete theme package for easy sharing with other projects

There is no barrier between the two methods, which means that we can debug the theme package in the first method first, and send a separate npm package after the theme package is stable.

## Directory Structure

Let's take a look at the standard dumi theme package structure:

<Tree title=".dumi/theme (Local theme) or dumi-theme-[name]/src（npm theme）">
  <ul>
    <li>
      builtins
      <small>Built-in component folder, dumi will look for <code>j|tsx</code> under <strong>first-level directory</strong> to mount, the components under this folder can be used directly in md</small>
    </li>
    <li>
      components
      <small>[Non-agreement] The theme package itself is a component extracted for maintainability, the folder name is customized by the developer</small>
    </li>
    <li>
      style
      <small>[Non-agreement] Theme package style sheet</small>
    </li>
    <li>
      layout.tsx
      <small>Custom layout component, props.children is the content of each md, developers can control the navigation, sidebar and content rendering by themselves</small>
    </li>
    <li>
      layouts
      <small>Custom layouts directory, used when you need to customize multiple layouts</small>
      <ul>
        <li>
          index.tsx
          <small>Same as src/layout.tsx, choose one of the two methods, layout.tsx has higher priority</small>
        </li>
        <li>
          demo.tsx
          <small>Custom component demo separate routing (~demos/:uuid) layout</small>
        </li>
      </ul>
    </li>
  </ul>
</Tree>

## Incremental customization

The directory structure does not seem simple?

In fact, all the above content can be customized incrementally.If a necessary file is not provided in the theme package, the default theme of dumi will be found.

The following files will be included:

1. `builtins/Previewer.tsx` - Render demo wrapper
2. `builtins/SourceCode.tsx` - Render code block and highlight
3. `builtins/Alert.tsx` - Render alert
4. `builtins/Badge.tsx` - Render badge
5. `layout.tsx` - The default global layout

## Custom body area

If you only want to control the rendering of the text area, you can choose the `layout` that wraps the default theme and the `children` that controls the `layout`.

For example, add a feedback button to the text area:

```tsx | pure
// .dumi/theme/layout.tsx(local theme) 或 src/layout.tsx(theme package)
import React from 'react';
import Layout from 'dumi-theme-default/es/layout';

export default ({ children, ...props }) => (
  <Layout {...props}>
    <>
      <button>Button</button>
      {children}
    </>
  </Layout>
);
```

## Development, debugging and use

The so-called theme development is essentially writing React components, but in order to reduce the cost of writing components, dumi provides a set of theme APIs and opens many dumi's built-in capabilities and data, which can help us quickly complete the theme development, see [Theme-Theme API](/theme/api).

Constant debugging is required during the development of the theme.

For local themes, dumi is fully automatically detected. As long as the `.dumi/theme` folder exists, dumi will be mounted during build; for independent theme npm packages, it needs to be written into `devDependencies`And link the npm package to the project, dumi will automatically mount the theme, for example:

```json
{
  "dependencies": {
    "dumi-theme-default": "0.0.0"
  }
}
```

- Local theme: The use and debugging of the theme is similar
- npm package: The user only needs to execute `npm install dumi-theme-[name] -D` to complete the installation of the theme package and start dumi When the theme will be automatically mounted
