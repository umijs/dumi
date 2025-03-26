import path from 'path';
import { afterAll, describe, expect, test } from 'vitest';
import type {
  EnumPropertyMetaSchema,
  LocalRefPropertyMetaSchema,
  MetaCheckerOptions,
  ObjectPropertyMetaSchema,
  PropertyMeta,
  TypeParamPropertyMetaSchema,
} from '../src/index';
import { createProject, vueTypesSchemaResolver } from '../src/index';
import { toRecord, tsconfigPath } from './utils';

const checkerOptions: MetaCheckerOptions = {
  forceUseTs: true,
  printer: { newLine: 1 },
  propertyResovlers: [vueTypesSchemaResolver],
  externalSymbolLinkMappings: {
    typescript: {
      Promise:
        'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
    },
  },
};

const project = createProject({
  tsconfigPath,
  checkerOptions,
});

function testFeatures(kind: 'tsx' | 'sfc' | 'sfc-alias') {
  const componentPath = path.resolve(__dirname, `fixtures/${kind}/index.ts`);
  describe(`${kind}: single Vue component meta`, () => {
    describe('props', () => {
      const { component } = project.service.getComponentMeta(
        componentPath,
        'Foo',
      );
      const propMap = toRecord(component.props);

      test('option props', () => {
        const titleProp = propMap['title'];
        expect(titleProp).toMatchObject({
          required: true,
          default: "'标题'",
          type: 'string',
        });
        expect(titleProp.comment.blockTags).toContainEqual({
          tag: 'default',
          content: [{ kind: 'text', text: "''" }],
        });
      });

      test('prop referenced by assignment', () => {
        const orderProp = propMap['order'];
        expect(orderProp).toMatchObject({
          required: true,
          default: '0',
          type: 'number',
        });
      });

      test('props using PropType type assertions', () => {
        const eProp = propMap['e'] as PropertyMeta;
        expect(eProp).toMatchObject({
          required: false,
          type: 'A | 1',
        });
        expect(
          (eProp.schema as EnumPropertyMetaSchema).schema?.[1],
        ).toMatchObject({
          type: 'number',
          kind: 'literal',
          value: '1',
        });
      });

      test('external reference destructuring assignment', () => {
        const cProp = propMap['c'];
        expect(cProp).toMatchObject({
          type: '"1" | "2" | "3"',
          schema: {
            schema: [
              {
                kind: 'literal',
                type: 'string',
                value: '"1"',
              },
              {
                kind: 'literal',
                type: 'string',
                value: '"2"',
              },
              {
                kind: 'literal',
                type: 'string',
                value: '"3"',
              },
            ],
          },
        });
      });

      // ExtractPropTypes cannot infer the type of vue-types
      test.skipIf(kind === 'sfc-alias')('using vue-types', () => {
        const bProp = propMap['b'];
        expect(bProp).toMatchObject({
          type: '{ c?: string; }',
          required: true,
          default: '{}',
        });
        const dProp = propMap['d'];
        expect(dProp).toMatchObject({
          type: 'number',
          required: false,
          default: '1',
        });
      });

      test('events in props', () => {
        const onClick = propMap['onClick'];
        if (kind === 'tsx') {
          expect(onClick.schema).matchSnapshot();
          expect(onClick.description).toBe('click event');
        } else {
          // Although we do not define it in `defineProps` when writing the component,
          // we can still handle events through the onClick prop when using this component.
          // This is because vue will pass the events in defineEmits into props when processing.
          // So we can still extract onClick from the props metadata,
          // but since this is generated through `@vue/runtime-core`
          // and is within the exclude range, we can treat it as `unknown`
          // When processing the transformer, pay attention to which signature of the same attribute from props and events is better.
          expect(onClick).toMatchObject({
            schema: {
              kind: 'unknown',
            },
          });
        }
      });

      test(`async functions`, () => {
        const promiseFunc = propMap['func'];
        expect(promiseFunc.schema).toMatchObject({
          schema: { isAsync: true },
        });
      });

      test('dom type', () => {
        const dom = propMap['dom'];
        expect(dom).toMatchObject({
          schema: {
            kind: 'ref',
            externalUrl:
              'https://developer.mozilla.org/docs/Web/API/HTMLElement',
            name: 'HTMLElement',
          },
          default: 'null',
        });
      });

      test('jsdoc', () => {
        expect(propMap['func'].comment.modifierTags).toContain('alpha');
        expect(propMap['c'].comment.modifierTags).toContain('experimental');
        expect(propMap['e'].comment.modifierTags).toContain('beta');
        expect(propMap['d'].comment.blockTags).toContainEqual({
          tag: 'deprecated',
          content: [],
        });
        expect(propMap['dom'].comment.blockTags).toContainEqual({
          tag: 'since',
          content: [{ kind: 'text', text: '0.0.1' }],
        });
      });
    });

    describe('emits/events', () => {
      const { component } = project.service.getComponentMeta(
        componentPath,
        'Foo',
      );
      const eventMap = toRecord(component.events);
      test('event signature meta should be same as normal methods', () => {
        expect(eventMap['change']).matchSnapshot();
      });

      test.skipIf(kind === 'tsx')('events defined via defineEmits', () => {
        expect(eventMap['click']).matchSnapshot();
      });
    });

    describe('slots', () => {
      const { component } = project.service.getComponentMeta(
        componentPath,
        'Foo',
      );
      const slotMap = toRecord(component.slots);

      test('normal slots', () => {
        expect(slotMap['icon'].type).toBe('any');
      });

      test('scoped slots', () => {
        expect(slotMap['item']).matchSnapshot();
      });
      test('jsdoc', () => {
        expect(slotMap['item'].comment?.blockTags).toContainEqual({
          tag: 'deprecated',
          content: [],
        });
        expect(slotMap['icon'].comment?.modifierTags).toContain('experimental');
      });
    });

    describe('expose api', () => {
      const { component } = project.service.getComponentMeta(
        componentPath,
        'Foo',
      );
      const exposed = toRecord(component.exposed);
      test('ref api', () => {
        expect(Object.keys(exposed)).toStrictEqual(['focus', 'count']);
        expect(exposed['count']).toMatchObject({
          type: 'number',
        });
        expect(exposed['focus']).matchSnapshot();
      });

      test('jsdoc', () => {
        expect(exposed['count'].comment?.blockTags).toContainEqual({
          tag: 'deprecated',
          content: [{ kind: 'text', text: 'will be released in 0.0.1' }],
        });
        expect(exposed['focus'].comment?.modifierTags).toContain('alpha');
      });
    });
  });

  describe.skipIf(kind !== 'tsx')('tsx: functional component', () => {
    const { components } =
      project.service.getComponentLibraryMeta(componentPath);
    test('anonymous', () => {
      expect(components['AnonymousFComponent']).toMatchSnapshot();
    });
    test('named', () => {
      expect(components['NamedFComponent']).toMatchSnapshot();
    });
  });

  describe.skipIf(kind !== 'tsx')('tsx: composition function', () => {
    const { components, functions } =
      project.service.getComponentLibraryMeta(componentPath);
    test('composition functions', () => {
      const funcNames = Object.keys(functions);
      expect(funcNames).toStrictEqual(['useInternalValue', 'useVNode']);
      expect(functions['useInternalValue']).toMatchObject({
        kind: 'function',
        schema: {
          arguments: [
            { key: 'upstreamValue', type: '() => T' },
            { key: 'updator', type: '(upstreamValue: T, oldValue?: T) => T' },
            {
              key: 'equal',
              type: '(internalValue: T, newValue: T) => boolean',
            },
          ],
        },
      });
      expect(functions['useVNode'].type).toContain('() => VNode');
    });
    test('use @component to identify functional component', () => {
      const schema = components['InternalComponent'];
      expect(schema.props[0]).toMatchObject({
        name: 'a',
        required: true,
        type: 'string',
      });
    });
  });

  test.skipIf(kind !== 'tsx')('generic component', () => {
    const { component, types } = project.service.getComponentMeta(
      componentPath,
      'List',
    );
    const typeParamRef = component
      .typeParams?.[0] as LocalRefPropertyMetaSchema;
    const typeParam = types[typeParamRef.ref] as TypeParamPropertyMetaSchema;
    expect(typeParam.type).toBe('Item extend BaseItem = BaseItem');
    const defaultRef = typeParam.schema?.default as LocalRefPropertyMetaSchema;
    const defaultType = types[defaultRef.ref] as ObjectPropertyMetaSchema;
    const extendRef = typeParam.schema?.type as LocalRefPropertyMetaSchema;
    const extendType = types[extendRef.ref] as ObjectPropertyMetaSchema;
    const baseItemObj = {
      id: { name: 'id', type: 'string | number' },
      text: { name: 'text' },
    };
    expect(defaultType.schema).toMatchObject(baseItemObj);
    expect(extendType.schema).toMatchObject(baseItemObj);
    // Only props of generic components can be automatically recognized
    expect(component.props).toMatchObject([
      { type: '() => BaseItem[] | Promise<BaseItem[]>', name: 'source' },
      { type: '(data: BaseItem[]) => void', name: 'onLoaded' },
    ]);
  });
}

testFeatures('tsx');
testFeatures('sfc');
testFeatures('sfc-alias');

afterAll(() => {
  project.close();
});
