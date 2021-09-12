---
title: Advanced
order: 3
toc: menu
---

## Multi-language

Making the documentation site multilingual is out of the box for dumi users.

For example, we wrote `docs/index.md` in English as the homepage of the site.

Now we want to increase the Chinese version of the site. Just create a Markdown file of the same name with the `zh-CN` locale suffix:

<Tree>
  <ul>
    <li>
      docs
      <ul>
        <li>
          index.md
          <small>Existing English homepage</small>
        </li>
        <li>
          index.zh-CN.md
          <small>Newly created Chinese homepage</small>
        </li>
      </ul>
    </li>
  </ul>
</Tree>

In this way, dumi will render the English homepage when visiting `www.example.com`, while rendering the Chinese homepage when visiting `www.example.com/zh-CN`.

It's same for other pages, just like the official website of dumi you are browsing now.

### Default language

In the default configuration of dumi, `en-US` is the default language, and `zh-CN` is the second language.

If you need to modify this configuration, like modifying the default language or adding more languages, please check [Configuration Items - locales](/config#locales).

### Missing translation

The translation of documents is usually carried out gradually, and there is bound to be a transition period of 『document translation in half』.

To make this transition period more friendly, **dumi will use the documents in the default language as the untranslated language documents**, for example:

<Tree>
  <ul>
    <li>
      docs
      <ul>
        <li>index.md</li>
        <li>index.zh-CN.md</li>
        <li>missing.md</li>
      </ul>
    </li>
  </ul>
</Tree>

Obviously `missing.zh-CN.md` is missing.

When a user visits `www.example.com/zh-CN/missing`, dumi will present the content of `missing.md` to the user.

## Umi integrated mode

In addition to independent component libraries, most of our projects will also have their own internal components.

It's usually troublesome to manage these internal component libraries.

There is no need to publish a separate npm package, but also need to be iterated, updated, Description, handover.

In order to make the management of the project's internal component library easier, dumi launched the Umi project integration mode:

- **Automatic detection**: When `dependencies` or `devDependencies` contains `umi` and `@umijs/preset-dumi`, it will open the integrated mode automaticly (you no longer need to install the `dumi` package)
- **Isolated**: All dumi documents will be centralized under the `/~docs` route, which is isolated from the original project and does not interfere with each other. It can be understood that the standard dumi documents have a specific routing prefix, including the user's navigation and menu routing configuration
- **No effect on production**: Only works when `NODE_ENV` is `development`, and does not affect the production build of the project
- **Built separately**: If you want to build a document separately for deployment, you can execute `umi build --dumi` to get a dumi site product in non-integrated mode. `--dumi` is also available under the `umi dev` command

The usage is very simple:

Install `@umijs/preset-dumi` in the existing Umi project into `devDependencies`, and then configure `resolve.includes` as needed (for example, the `src/components` directory usually conventional defined as business component libraries and the documents corresponding to libraries).

## UI assets meta data

How to understand assets meta data? From the developer's perspective, in a narrow sense, any entity that can be produced to help downstream improve efficiency can be called an asset, such as components, documents, component APIs, component demos & etc.

In the process of component development, we create assets all the time. The released npm package is naturally an asset, and the written TypeScript type definitions and carefully prepared component library demos are also assets. Now only one command is needed to digitize the assets completed by dumi and the developer. This data can Follow the npm package iteration, release, and then transfer to downstream tools.

We select Umi UI for example, the usage process is shown in the figure below:

<p style="text-align: center;">
  <img src="https://gw.alipayobjects.com/zos/bmw-prod/b6bc8d0a-c83e-4cd7-91fb-2464e8974a8a/kijxaoib_w2078_h1757.png" width="800" >
</p>

### 1. Initialize the dumi component development project

```bash
$ mkdir dumi-lib && cd dumi-lib
$ npx @umijs/create-dumi-lib
```

### 2. Add asset meta information for demo

Take the demo of the initial project as an example, open `src/Foo/index.md` and add the following frontmatter configuration:

<pre lang="diff">
// src/Foo/index.md

```jsx
+ /**
+  * title: Foo demo
+  * thumbnail: [URL address of thumbnail]
+  * previewUrl: [URL address of preview]
+  */
import React from 'react';
import { Foo } from 'dumi-lib';

export default () => <Foo title="First Demo" />;
```
</pre>

In addition to writing frontmatter in the source code, adding attributes to the `code` tag of the external demo can also add meta-information:

```html
<code
  src="/path/to/demo.tsx"
  title="demo name"
  thumbnail="URL address of thumbnail"
  previewUrl="URL address of preview"
/>
```

### 3. Enable metadata generation capabilities

Add an npm script to `package.json` and declare the `dumiAssets` field. Umi UI will find asset metadata files based on this field:

```diff
{
  "scripts": {
+   "postversion": "dumi assets"
  },
+ "dumiAssets": "assets.json"
}
```

Since `assets.json` does not need to participate in version control, please add `assets.json` to `gitignore`.

### 4. Build and generate asset metadata

If it's just for testing, you can use `npm version` instead of `npm publish`, and then use link for local play:

```bash
$ npm run build
$ npm version patch -m "build: bump version to %s"
```

### 5. Used in Umi UI

Initialize the Umi application, install Umi UI and link the component library we just made:

```bash
$ mkdir umi-app && cd umi-app
$ npx @umijs/create-dumi-app
$ npm i @umijs/preset-ui -D
$ npm link path/to/dumi/lib
```

In the `package.json` of the Umi application, manually add the component library as a dependency:

```diff
{
  "dependencies": {
    // Other dependencies
+   "your-lib-package-name": "*"
  }
}
```

Then start the Umi project as usual, you can see the demo assets in the dumi-lib project in the mini bubble of Umi UI, and can be directly inserted into the page for use:

<p style="text-align: center;">
  <img src="https://gw.alipayobjects.com/zos/bmw-prod/4102a494-e4d8-494e-a790-1a7a5562da51/kc6gnqjd_w680_h387.gif" width="680">
</p>

## Mobile component development

The usage is very simple. After initializing the dumi project, install `dumi-theme-mobile` into `devDependencies`, and dumi will switch from the default PC component library development to mobile component library development.

<img style="border: 1px solid #eee;" src="https://gw.alipayobjects.com/zos/bmw-prod/acb29a94-6200-4798-82eb-190177fa841c/kezwf18r_w2556_h1396.jpeg" alt="Mobile theme preview effect" />

Visit [Theme List - mobile](/theme#dumi-theme-mobile) to learn more about the features and HD solutions of mobile themes.

## Automatic component API generation

Now, we can realize the automatic generation of component API through JS Doc annotation + TypeScript type definition!

### Types and annotations in component source code

The premise of automatic component API generation is to ensure that dumi can deduce the content of the API through TypeScript type definition + annotations, such as the source code of the `Hello` component:

```tsx | pure
import React from 'react';

export interface IHelloProps {
  /**
   * You can write the attribute description like this
   * @description        You can also explicitly add a description name
   * @description.zh-CN  Also supports different locale suffixes to achieve multi-language description
   * @default            Support for defining default values
   */
  className?: string; // Support for identifying TypeScript optional types as optional attributes
}

const Hello: React.FC<IHelloProps> = () => <>Hello World!</>;

export default Hello;
```

The type analysis tool dumi based is `react-docgen-typescript`.

For more types and annotation usage, please refer to [documentation](https://github.com/styleguidist/react-docgen-typescript#example).

### Show the API in the documentation

With the source code that can derive the API, we can render the API table through the built-in components of `API` in Markdown:

```md
<!-- Not passing src will automatically detect the current component, such as src/Hello/index.md will recognize src/Hello/index.tsx -->

<API></API>

<!-- Passing src will explicitly specify the API of which component to render -->

<API src="/path/to/your/component.tsx"></API>

<!-- src can use alias -->

<API src="@/your/component.tsx"></API>

<!-- Passing exports will explicitly indicate which exports to render, please make sure the value is a valid JSON string -->

<API exports='["default", "Other"]'></API>

<!-- Use hideTitle if you don't need a title -->

<API hideTitle></API>

```

The effect is roughly as follows:

<API src="../.demos/Hello/index.tsx"></API>

> When `src` uses `alias`, the built-in `@` and `@@` do not take effect, and you need to manually specify `alias` in the configuration file.

### Custom API table rendering

Like other built-in components, the `API` component also supports override through the theme API.

You only need to create a `.dumi/theme/builtins/API.tsx` (local theme) or create a theme package containing `API.tsx`, combining with the `useApiData` hook exposed by `dumi/theme`, you can control the rendering of the API table yourself.

Please refer to the [API component implementation](https://github.com/umijs/dumi/blob/master/packages/theme-default/src/builtins/API.tsx) of the dumi default theme.
