# @dumijs/vue-meta

Extracting the metadata of Vue components more effectively.

This project is heavily inspired by [vue-component-meta](https://github.com/vuejs/language-tools/tree/master/packages/component-meta), and reuses a significant amount of its code.

## Install

```bash
pnpm i @dumijs/vue-meta
```

## Usage

`@dumijs/vue-meta` uses TypeScript's TypeChecker for metadata extraction.

> \[!NOTE]
> When configuring tsconfig.json, set strictNullCheck to false
>
> ```json
> {
>   "compilerOptions": {
>     "strictNullChecks": false
>   }
> }
> ```

```ts
import { createProject } from '@dumijs/vue-meta';
import * as path from 'path';

const projectRoot = '<project-root>';
const project = createProject({
  rootPath: projectRoot,
  // If tsconfigPath is not set, tsconfig will be <rootPath>/tsconfig.json
  tsconfigPath: path.resolve(projectRoot, './tsconfig.json');
});

const entry = path.resolve(projectRoot, './src/index.ts');

const meta = project.service.getComponentLibraryMeta(entry);

meta.components['Button'];

// Reusable types, queried and referenced through `ref`
// (`ref` is the md5 value calculated from the name of the file where the type is located and its type name.)
meta.types;
```

After updating the file locally, use `patchFiles` to update the file in memory, and TypeChecker will recheck.

```ts
project.patchFiles([
  {
    action: 'add',
    fileName: '...',
    text: '...',
  },
  {
    update: 'add',
    fileName: '....',
    text: '....',
  },
]);

// Then you can get the new type metadata
const meta = project.service.getComponentLibraryMeta(entry);
```

## API

<!-- start {API} -->

### project

#### createProject()

<img style="display: inline-block; vertical-align: top;" alt="Function" src="https://img.shields.io/badge/Function-666eff?style=flat"> Create a meta checker for Vue project with rootPath

If no parameters are passed in, tsconfig.json in the current workspace will be read.

##### Type

```typescript
export declare function createProject(rootPath?: string): Project;
```

##### Examples

```ts
import { createProject } from '@dumijs/vue-meta';
createProject();
```

##### Parameters

- `rootPath` **_string_** <img style="display: inline-block; vertical-align: top;" alt="optional" src="https://img.shields.io/badge/optional-8e96aa?style=flat">

##### Returns [`Project`](#)

#### createProject()

<img style="display: inline-block; vertical-align: top;" alt="Function" src="https://img.shields.io/badge/Function-666eff?style=flat"> Create a meta checker for Vue project by options

##### Type

```typescript
export declare function createProject(options: CheckerProjectOptions): Project;
```

##### Examples

```ts
import { createProject } from '@dumijs/vue-meta';
// Manually pass in the tsconfig.json path
createProject({
  // If neither rootPath nor tsconfigPath is set, rootPath will be process.cwd()
  rootPath: '<project-root>',
  // If tsconfigPath is not set, tsconfig will be <rootPath>/tsconfig.json
  tsconfigPath: '<project-root>/tsconfig.json',
  checkerOptions: {},
});
```

##### Parameters

- `options` [**_CheckerProjectOptions_**](#)

##### Returns [`Project`](#)

#### createProjectByJson()

<img style="display: inline-block; vertical-align: top;" alt="Function" src="https://img.shields.io/badge/Function-666eff?style=flat"> Create component metadata checker through json configuration

##### Type

```typescript
export declare function createProjectByJson(
  options: CheckerProjectJsonOptions,
): Project;
```

##### Parameters

- `options` [**_CheckerProjectJsonOptions_**](#)

##### Returns [`Project`](#)

### options

#### MetaCheckerOptions

<img style="display: inline-block; vertical-align: top;" alt="Interface" src="https://img.shields.io/badge/Interface-666eff?style=flat"> Checker Options

##### Type

```typescript
export interface MetaCheckerOptions extends MetaCheckerSchemaOptions
```

**Extends:** [**_MetaCheckerSchemaOptions_**](#metacheckerschemaoptions)

##### Properties

- [`disableGit`](#) **_boolean_** <img style="display: inline-block; vertical-align: top;" alt="optional" src="https://img.shields.io/badge/optional-666eff?style=flat">

  Prohibit obtaining git repo URL, git revision, and other information through git commands, the default is false

- [`disableSources`](#) **_boolean_** <img style="display: inline-block; vertical-align: top;" alt="optional" src="https://img.shields.io/badge/optional-666eff?style=flat">

  Disable production of source links, the default is false

- [`filterExposed`](#) **_boolean_** <img style="display: inline-block; vertical-align: top;" alt="optional" src="https://img.shields.io/badge/optional-666eff?style=flat">

  Whether to enable filtering for exposed attributes, the default is true.

  If true, only methods or properties identified by release tags like `@public` will be exposed in jsx

- [`filterGlobalProps`](#) **_boolean_** <img style="display: inline-block; vertical-align: top;" alt="optional" src="https://img.shields.io/badge/optional-666eff?style=flat">

  Whether to filter global props, the default is true

  If it is true, global props in vue, such as key and ref, will be filtered out

- [`forceUseTs`](#) **_boolean_** <img style="display: inline-block; vertical-align: top;" alt="optional" src="https://img.shields.io/badge/optional-666eff?style=flat">

- [`gitRemote`](#) **_string_** <img style="display: inline-block; vertical-align: top;" alt="optional" src="https://img.shields.io/badge/optional-666eff?style=flat">

  Default is "origin"

- [`gitRevision`](#) **_string_** <img style="display: inline-block; vertical-align: top;" alt="optional" src="https://img.shields.io/badge/optional-666eff?style=flat">

  <https://git-scm.com/book/en/v2/Git-Tools-Revision-Selection>

- [`printer`](#) **_ts.PrinterOptions_** <img style="display: inline-block; vertical-align: top;" alt="optional" src="https://img.shields.io/badge/optional-666eff?style=flat">

- [`sourceLinkTemplate`](#) **_string_** <img style="display: inline-block; vertical-align: top;" alt="optional" src="https://img.shields.io/badge/optional-666eff?style=flat">

  source link template, must be set when you set `disableGit`<!-- -->.

  A typical template looks like this: `https://github.com/umijs/dumi/{gitRevision}/{path}#L{line}`<!-- -->.

  The parser will replace the parts `{gitRevision|path|line}`

#### MetaCheckerSchemaOptions

<img style="display: inline-block; vertical-align: top;" alt="Interface" src="https://img.shields.io/badge/Interface-666eff?style=flat"> Schema resolver options

##### Type

```typescript
export interface MetaCheckerSchemaOptions
```

##### Properties

- [`disableExternalLinkAutoDectect`](#) **_boolean_** <img style="display: inline-block; vertical-align: top;" alt="optional" src="https://img.shields.io/badge/optional-666eff?style=flat">

  By default, this option is false, the resolver will automatically capture the MDN links contained in the comments of all declaration files under node_modules/typescript/lib. Users do not need to configure externalSymbolLinkMappings themselves.

  Of course, you can also overwrite the captured links through externalSymbolLinkMappings

- [`exclude`](#) **_string |_** **_RegExp_** **_| (string |_** **_RegExp_**<!-- -->**_)\[] | ((name: string) => boolean)_** <img style="display: inline-block; vertical-align: top;" alt="optional" src="https://img.shields.io/badge/optional-666eff?style=flat">

  By default, type resolution in node_module will be abandoned.

- [`externalSymbolLinkMappings`](#) **_Record_**<!-- -->**_\<string,_** **_Record_**<!-- -->**_\<string, string>>_** <img style="display: inline-block; vertical-align: top;" alt="optional" src="https://img.shields.io/badge/optional-666eff?style=flat">

  The types/interfaces mapping method is provided as follows:

  ```js
  {
    typescript: {
      Promise:
        'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
    },
  },
  ```

  For more complex mapping methods, please use `unknownSymbolResolvers`

- [`ignore`](#) **_(string | ((name: string, type:_** **_ts.Type_**<!-- -->**_, typeChecker:_** **_ts.TypeChecker_**<!-- -->**_) => boolean | void | undefined | null))\[]_** <img style="display: inline-block; vertical-align: top;" alt="optional" src="https://img.shields.io/badge/optional-666eff?style=flat">

  A list of type names to be ignored in expending in schema. Can be functions to ignore types dynamically.

- [`ignoreTypeArgs`](#) **_boolean_** <img style="display: inline-block; vertical-align: top;" alt="optional" src="https://img.shields.io/badge/optional-666eff?style=flat">

  In addition to ignoring the type itself, whether to ignore the type parameters it carries. By default, the type parameters it carries will be parsed. For example, `Promise<{ a: string }>`<!-- -->, if you use option`exclude` or `ignore` to ignore `Promise`<!-- -->, `{ a: string }` will still be parsed by default.

- [`propertyResovlers`](#) [**_PropertySchemaResolver_**](#propertyschemaresolver)<!-- -->**_<_**[**_PropertyMeta_**](#)<!-- -->**_>\[]_** <img style="display: inline-block; vertical-align: top;" alt="optional" src="https://img.shields.io/badge/optional-666eff?style=flat">

  Property schema resolvers for some special props definition methods, such as `vue-types`

- [`unknownSymbolResolvers`](#) [**_UnknownSymbolResolver_**](#unknownsymbolresolver)<!-- -->**_\[]_** <img style="display: inline-block; vertical-align: top;" alt="optional" src="https://img.shields.io/badge/optional-666eff?style=flat">

  unknownSymbol resolver

#### PropertySchemaResolver

<img style="display: inline-block; vertical-align: top;" alt="TypeAlias" src="https://img.shields.io/badge/TypeAlias-666eff?style=flat"> property schema resolver

##### Type

```typescript
export type PropertySchemaResolver<T extends ComponentItemMeta> = (
  originMeta: Partial<T>,
  options: {
    ts: typeof import('typescript/lib/tsserverlibrary');
    typeChecker: ts.TypeChecker;
    schemaOptions: MetaCheckerSchemaOptions;
    symbolNode: ts.Expression;
    prop: ts.Symbol;
    targetNode?: ts.Declaration;
    targetType?: ts.Type;
  },
) => Partial<T>;
```

**References:** [**_ComponentItemMeta_**](#)<!-- -->, [**_MetaCheckerSchemaOptions_**](#metacheckerschemaoptions)

#### UnknownSymbolResolver

 <img style="display: inline-block; vertical-align: top;" alt="TypeAlias" src="https://img.shields.io/badge/TypeAlias-666eff?style=flat">

##### Type

```typescript
export type UnknownSymbolResolver<
  T extends PropertyMetaSchema = PropertyMetaSchema,
> = (options: {
  ts: typeof import('typescript/lib/tsserverlibrary');
  typeChecker: ts.TypeChecker;
  targetSymbol: ts.Symbol;
  schemaOptions: MetaCheckerSchemaOptions;
  targetNode: ts.Declaration;
}) => Partial<T>;
```

**References:** [**_PropertyMetaSchema_**](#)<!-- -->, [**_MetaCheckerSchemaOptions_**](#metacheckerschemaoptions)

### project.service

#### TypeCheckService

<img style="display: inline-block; vertical-align: top;" alt="Class" src="https://img.shields.io/badge/Class-666eff?style=flat"> Provide component metadata checker services

##### Type

```typescript
export declare class TypeCheckService
```

##### Constructors

- [`(constructor)`](#)

  Constructs a new instance of the `TypeCheckService` class

##### Methods

- [`(constructor)`](#)

  Constructs a new instance of the `TypeCheckService` class

- [`close`](#)

  Close the Type checker service

- [`getComponentLibraryMeta`](#)

  Get component metadata through the entry file, this method will automatically filter vue components

- [`getComponentMeta`](#)

  Get metadata of single component If the component to be obtained is not a vue component, an error will be thrown

- [`getExported`](#)

  Get the export

- [`getExportNames`](#)

  only get value export

<!-- end -->

## Supported JSDoc tags

> \[!NOTE]
> It is recommended to define events in props so that you can get complete JSDoc support

### @description

Description of the property.

### @default

When the prop option `default` uses as function, `default` will be ignored. In this case, you can use `@default` to override it.

```ts
defineComponent({
  props: {
    /**
     * @default {}
     */
    foo: {
      default() {
        return {};
      },
    },
  },
});
```

### @component

This is used to distinguish between ordinary functions and function components.

Currently, there are two situations that cannot be automatically recognized as components:

```ts
/**
 * @component
 */
function InternalComponent(props: { a: string }) {
  return h('div', props.a);
}
```

```tsx
/**
 * @component
 */
export const GenericComponent = defineComponent(
  <T>(props: { item: T }) => {
    return () => (<div>{item}</div>);
  },
);
```

It needs to be annotated with @component, otherwise it will be recognized as a function

---

### Release related

#### @public

#### @deprecated

#### @experimental/@beta

#### @alpha

> \[!NOTE]
> These release tags cannot take effect in defineEmits

For methods on the component instance itself, use release tags like `@public` to expose

```ts
defineExpose({
  /**
   * @public
   */
  focus() {},
});
```

If you set `filterExposed` in MetaCheckerOptions to false, those release tags will become invalid.

> The component instance of vue will not only expose the properties and methods exposed through `expose`, but also expose the props passed in from the outside.

---

### @ignore/@internal

Properties marked with `@ignore` or `@internal` will not be checked.

---

### Version control related

#### @version

#### @since

---

## TODO

- [x] externalSymbolLinkMap support
- [x] resolve Functional component
- [ ] ~~resolve Vue class component~~
