import path from 'path';
import { afterAll, describe, expect, test } from 'vitest';
import type {
  EnumPropertyMetaSchema,
  MetaCheckerOptions,
  PropertyMeta,
} from '../src/index';
import { createProject, vueTypesSchemaResolver } from '../src/index';
import { toRecord } from './utils';

const checkerOptions: MetaCheckerOptions = {
  forceUseTs: true,
  printer: { newLine: 1 },
  schema: {
    customResovlers: [vueTypesSchemaResolver],
  },
};

const project = createProject({
  tsconfigPath: path.resolve(__dirname, 'fixtures/tsconfig.json'),
  checkerOptions,
});

function testFeatures(kind: 'tsx' | 'sfc' | 'sfc-alias') {
  describe(`${kind}: single Vue component meta`, () => {
    const componentPath = path.resolve(__dirname, `fixtures/${kind}/index.ts`);
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
          tags: { default: ["''"] },
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
            kind: 'unknown',
            type: 'HTMLElement',
          },
          default: 'null',
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
    });

    describe('expose api', () => {
      const { component } = project.service.getComponentMeta(
        componentPath,
        'Foo',
      );
      const exposed = toRecord(component.exposed);
      test('ref api', () => {
        expect(exposed['count']).toMatchObject({
          type: 'number',
        });
        expect(exposed['focus']).matchSnapshot();
      });
    });
  });
}

testFeatures('tsx');
testFeatures('sfc');
testFeatures('sfc-alias');

afterAll(() => {
  project.close();
});
