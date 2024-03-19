# @dumijs/vue-meta

Extracting the metadata of Vue components more effectively.

This project is heavily inspired by [vue-component-meta](https://github.com/vuejs/language-tools/tree/master/packages/component-meta), and reuses a significant amount of its code.

## Install

```bash
pnpm i @dumijs/vue-meta
```

## Usage

`@dumijs/vue-meta` uses TypeScript's TypeChecker for metadata extraction.

> [!NOTE]
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

## project

The following API is used to create Checker Project

### createProject

▸ **createProject**(`options?`): Project

Create a meta checker for Vue project

#### Parameters

| Name       | Type                                                   |
| :--------- | :----------------------------------------------------- |
| `options?` | string \| [CheckerProjectOptions](#metacheckeroptions) |

**`Example`**

```ts
import { createProject, vueTypesSchemaResolver } from '@dumijs/vue-meta';
// Manually pass in the tsconfig.json path
const project = createProject({
  tsconfigPath: '<project-root>/tsconfig.json',
  checkerOptions: {
    schema: {
      customResovlers: [vueTypesSchemaResolver],
    },
  },
});
```

In addition to the `vueTypesSchemaResolver` for [vue-types](https://github.com/dwightjack/vue-types), users can also write their own schema resolvers for any prop definition paradigm.

If no parameters are passed in, tsconfig.json in the current workspace will be read.

```ts
import { createProject } from '@dumijs/vue-meta';

const project = createProject();
```

### createProjectByJson

▸ **createProjectByJson**(`options`): Project

Create component metadata checker through json configuration

#### Parameters

| Name      | Type                      |
| :-------- | :------------------------ |
| `options` | CheckerProjectJsonOptions |

---

The following APIs are mainly used to update files in memory

### addFile

▸ **addFile**(`fileName`, `text`): `void`

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `fileName` | `string` |
| `text`     | `string` |

### updateFile

▸ **updateFile**(`fileName`, `text`): `void`

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `fileName` | `string` |
| `text`     | `string` |

### deleteFile

▸ **deleteFile**(`fileName`): `void`

#### Parameters

| Name       | Type     |
| :--------- | :------- |
| `fileName` | `string` |

### patchFiles

▸ **patchFiles**(`files`): `void`

#### Parameters

| Name    | Type                                                                     |
| :------ | :----------------------------------------------------------------------- |
| `files` | { `action`: `PatchAction` ; `fileName`: `string` ; `text?`: `string` }[] |

---

### close

▸ **close**(): `void`

Close the project, the checker service will be unavailable,
and the file cache will be cleared.

---

## project.service

The following API is the checker service provided by the `project`.

### getComponentLibraryMeta

▸ **getComponentLibraryMeta**<`T`\>(`entry`, `transformer?`): `T`

Get component metadata through the entry file, this method will automatically filter vue components

#### Parameters

| Name           | Type                  | Description                                 |
| :------------- | :-------------------- | :------------------------------------------ |
| `entry`        | `string`              | Entry file, export all components and types |
| `transformer?` | MetaTransformer<`T`\> | -                                           |

**`Example`**

You can pass in a customized transformer to generate metadata that adapts to dumi. `dumiTransfomer` is the officially provided adapter.

```ts
import { dumiTransfomer, createProject } from '@dumijs/vue-meta';
const project = createProject({
  tsconfigPath: '<project-root>/tsconfig.json',
  checkerOptions,
});

project.service.getComponentLibraryMeta(entry, dumiTransfomer);
```

### getComponentMeta

▸ **getComponentMeta**(`componentPath`, `exportName?`): ComponentMeta

Get metadata of single component
If the component to be obtained is not a vue component, an error will be thrown

#### Parameters

| Name            | Type     | Default value | Description                                                   |
| :-------------- | :------- | :------------ | :------------------------------------------------------------ |
| `componentPath` | `string` | `undefined`   |                                                               |
| `exportName`    | `string` | `'default'`   | Component export name, the default is to get `export default` |

**`Example`**

```ts
import { dumiTransfomer, createProject } from '@dumijs/vue-meta';
const project = createProject({
  tsconfigPath: '<project-root>/tsconfig.json',
  checkerOptions,
});
const meta = project.service.getComponentMeta(componentPath, 'Foo');
```

## Options

### MetaCheckerOptions

#### filterExposed

• `Optional` **filterExposed**: `boolean`

Whether to enable filtering for exposed attributes, the default is true
If true, only methods or properties identified by `@exposed/@expose` will be exposed in jsx

#### filterGlobalProps

• `Optional` **filterGlobalProps**: `boolean`

Whether to filter global props, the default is true
If it is true, global props in vue, such as key and ref, will be filtered out

#### forceUseTs

• `Optional` **forceUseTs**: `boolean`

The default is true

#### printer

• `Optional` **printer**: `PrinterOptions`

#### schema

• `Optional` **schema**: [`MetaCheckerSchemaOptions`](#metacheckerschemaoptions)

### MetaCheckerSchemaOptions

Ƭ **MetaCheckerSchemaOptions**: `Object`

Schema resolver options

#### Type declaration

| Name               | Type                                                                                                                                   | Description                                                                                                                                                                                                                                                                                               |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `customResovlers?` | `CustomSchemaResolver`[]                                                                                                               | Customized schema resolvers for some special props definition methods, such as `vue-types`                                                                                                                                                                                                                |
| `exclude?`         | `string` \| `RegExp` \| (`string` \| `RegExp`)[] \| (`name`: `string`) => `boolean`                                                    | By default, type resolution in node_module will be abandoned.                                                                                                                                                                                                                                             |
| `ignore?`          | (`string` \| (`name`: `string`, `type`: `ts.Type`, `typeChecker`: `ts.TypeChecker`) => `boolean` \| `void` \| `undefined` \| `null`)[] | A list of type names to be ignored in expending in schema. Can be functions to ignore types dynamically.                                                                                                                                                                                                  |
| `ignoreTypeArgs?`  | `boolean`                                                                                                                              | In addition to ignoring the type itself, whether to ignore the type parameters it carries. By default, the type parameters it carries will be parsed. For example, `Promise<{ a: string }>`, if you use option`exclude` or `ignore` to ignore `Promise`, `{ a: string }` will still be parsed by default. |

## Supported JSDoc tags

> [!NOTE]
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

> [!NOTE]
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

---

### @ignore/@internal

Properties marked with `@ignore` or `@internal` will not be checked.

### Version control related

#### @version

#### @since

---

## TODO

- [ ] externalSymbolLinkMap support
- [x] resolve Functional component
- [ ] ~~resolve Vue class component~~
