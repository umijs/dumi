---
title: FrontMatter
toc: menu
---

# FrontMatter

Like most documentation tools, in order to enable Markdown files to perform configurations capabilities, dumi also provides some FrontMatter configurations; There are some specials that dumi not only supports Markdown files for FrontMatter configuration, but also supports FrontMatter configuration of TSX/JSX imported by external demos.

The FrontMatter for Markdown files is as follows:

<pre>---
title: title content
---
</pre>

The FrontMatter for TSX/JSX files is as follows:

<pre>
/**
 * title: title content
 */
</pre>

## The FrontMatter configurations supported by Markdown

### title

- Type: `String`
- Default: `null`
- Details:

Configure the page title, which will be used as the subtitle of the page title and the left menu.

If the user does not configure, the website title will only present the main title; The name of the left menu defaults to the file name of the Markdown file (without suffix).

### sidemenu

- Type: `Boolean`
- Default: `true`
- Details:

Control the display of the sidebar menu.

### toc

- Type: `false | 'content' | 'menu'`
- Default: `'content'`
- Details:

Control the presentation or position of the anchor directory. When the value is `false`, it will not be presented. When the value is `content`, it will be presented on the right side of the content area (Affix Menu). When the value is `menu`, **the anchor of the current route** will be presented in the left menu.

### order

- Type: `Number`
- Default: `null`
- Details:

Control the sorting order of the document, the smaller the value, the higher the sort.

### legacy

- Type: `String`
- Default: `null`
- Details:

Links to the old path of the document (specify from the root path) to avoid getting `404` from the original path after migrating from other documents to dumi.

### group

- Type: `Object`
- Default: `null`
- Details:

This configuration is used to group the current page so that it can be grouped and presented in the sidebar menu. We can generate group by configuring the `group` through the next three FrontMatter configurations, or automatically based on dumi's folder nesting, for example:

```
.
└── src/
    ├── components/
        ├── index.md
        ├── a.md
        ├── b.md
```

dumi will automatically specify `group.title` as `Components` and specify `group.path` as `/components` for `index.md`, `a.md`, and `b.md`. And we can use FrontMatter to **selectively copy** the generated default configuration, such as:

```yaml
---
group:
  title: component
---

```

Eventually, the `group.path` will still generated to `/components`, but `group.title` generated to `component`.

#### group.title

- Type: `String`
- Details:

It is used to configure the name of the group in the sidebar menu. If it is not configured, it will read `group.path` by default and convert it to `title`. For example, `/components` will be converted to `Components`.

#### group.path

- Type: `String`
- Details:

**Required**, configure the routes prefix of this group. When `location.pathname` matches this prefix, the menu group will be marked as active.

#### group.order

- Type: `Number`
- Default: `null`
- Details:

Control the presented order of the document, the smaller the value, the higher the sort.

### nav

- Type: `Object`
- Default: `null`
- Details:

**Only works in site mode**, this configuration is used to manually specify the navigation menu where the current document is located. By default, it is automatically generated based on the first-level route path, and the sub-configurations are consistent with `group`.

#### nav.title

Omitted, same as `group.title`.

#### nav.path

Omitted, same as `group.path`.

#### nav.order

Omitted, same as `group.order`.

### hero

- Type: `Object`
- Default: `null`
- Details:

Only works in site mode, the page will be presented as a homepage after configuring.

#### hero.image

- Type: `String`
- Default: `null`
- Details:

Configure the title image of the homepage.

#### hero.title

- Type: `String`
- Default: `null`
- Details:

Configure the headline of the homepage.

#### hero.desc

- Type: `String`
- Default: `null`
- Details:

Configure the introduction text of the homepage.

#### hero.actions

- Type: `Array`
- Default: `null`
- Details:

Configure the operation buttons of the homepage. The first button will be presented as the main button. The configurations are as follows:

```yaml
hero:
  actions:
    - text: Getting Started
      link: /getting-started
```

### features

- Type: `Object`
- Default: `null`
- Details:

Only works in site mode. The page will be presented as the homepage after configuration, used to present the features of the component library in the form of 3 per line. The configuration format is as follows:

```yaml
features:
  - icon: The URL of icon, recommended size is 144 * 144 (optional)
    title: title content
    desc: support `markdown` text
```

### footer

- Type: `Markdown`
- Default: `null`
- Details:

Configure the footer of the current page. It is recommended to configure the home page. Currently, not support to configura all pages.

### translateHelp

- Type: `Boolean`
- Default: `false`
- Details:

Whether to present the 『Help Translation』 prompt at the top of the page.

### hide <Badge>1.1.0-beta.30+</Badge>

- Type: `Boolean`
- Default: `false`
- Details:

You can hide specific documentation that you do not want to display on the webpack in production env, and this option does not affect the development env.

## FrontMatter configurations supported by TSX/JSX

### title

- Type: `String`
- Default: `null`
- Details:

It is used to configure the title of the demo, which will be presented in the Demo previewer.

### desc

- Type: `Markdown`
- Default: `null`
- Details:

It is used to configure the description of the Demo, which will be presented in the Demo previewer, and support Markdown.

### compact

- Type: `Boolean`
- Default: `false`
- Details:

Use to remove padding for demo container.

### background

- Type: `CSSPropertyValue`
- Default: `null`
- Details:

Use to configure background for demo container.

### inline

- Type: `Boolean`
- Default: `false`
- Details:

It is used to indicate that the demo is a inline demo, which will be directly embedded in the document, and will not be wrapped by the demo wrapper, and users cannot view the source code.

### transform

- Type: `Boolean`
- Default: `false`
- Details:

It is used to control whether the demo wrapper sets the CSS value of `transform` to control the position of the elements of `position: fixed;` relative to the demo wrapper.

### defaultShowCode

- Type: `Boolean`
- Default: `false`
- Details:

It is used to control whether the demo wrapper expands the presentation of source code by default.

### debug <Badge>1.1.0-beta.30+</Badge>

- Type: `Boolean`
- Default: `false`
- Details:

Mark this demo as debug demo, it means this demo will not render in production mode, in additional, dumi will render a `DEV ONLY` badge for all debug demos in development mode, so that can help developers recognize them.

### hideActions

- Type: `Array<'CSB' | 'EXTERNAL'>`
- Default: `[]`
- Details:

It is used to control the hiding of some function buttons of the Demo previewer. The configuration values have the following meanings:

- CSB: Hide the button 『Open in codesandbox.io』
- EXTERNAL: Hide the button 『open in new window』

Configure via the attributes of the code tag:

```html
<!-- Attention, single quotes are required, to make sure the value is a valid JSON string -->
<code hideActions='["CSB"]' />
```

Configure via frontmatter:

```ts
/**
 * hideActions: ["CSB"]
 * hideActions:
 *   - CSB
 */

// Both of the above methods can be identified
```

### iframe <Badge>1.1.0-beta.30+</Badge>

- Type: `Boolean | Number`
- Default: `false`
- Details:

Use iframe mode to render this demo, it is very useful for layout demo, we can control the iframe height via pass a number value, check out [iframe mode](/guide/control-demo-render#iframe-mode) to get more informations.

### Controlled by `code` tag

All configurations supported by TSX/JSX can also be used when importing external demos using the `code` tag, like this:

```html
<code title="title" desc="desc" src="/path/to/demo" />
```
