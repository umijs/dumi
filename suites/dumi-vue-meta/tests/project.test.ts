import path from 'path';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { Project, createProject } from '../src/index';
import { toRecord } from './utils';

const fixturesPath = path.resolve(__dirname, './fixtures');
const entry = path.resolve(__dirname, 'fixtures/index.ts');
const tsconfigPath = path.resolve(__dirname, 'fixtures/tsconfig.json');

describe('project file manipulation', () => {
  // TODO: should use vitual filesystem, and should mock partial filesystem
  let project!: Project;

  beforeAll(() => {
    project = createProject({
      tsconfigPath: path.resolve(fixturesPath, './tsconfig.json'),
    });
  });
  test('patchFiles', () => {
    const tsxPath = path.resolve(fixturesPath, './tsx/index.ts');

    project.patchFiles([
      {
        action: 'remove',
        fileName: tsxPath,
      },
      {
        action: 'update',
        fileName: entry,
        text: `
import { defineComponent } from 'vue';
export { default as FooSfc } from './sfc/foo.vue';
export const Button = defineComponent({
  name: 'MyButton',
  props: {
    type: String,
  },
  setup() {
    return () => (
      <button></button>
    );
  },
});
`,
      },
    ]);

    const meta = project.service.getComponentLibraryMeta(entry);

    expect(meta.components['Button']).toBeDefined();
    expect(meta.components['Foo']).toBeUndefined();
  });

  afterAll(() => {
    project.close();
  });
});

describe('create project api', () => {
  let project!: Project;

  test('create with RootPath', () => {
    project = createProject(fixturesPath);
    expect(project.service.getExportNames(entry)).toContain('Foo');
  });

  afterEach(() => {
    project.close();
  });
});

describe('schema config', () => {
  let project!: Project;
  test('externalSymbolLinkMappings', () => {
    const elementUrl = 'https://devdocs.io/dom/htmlelement';
    project = createProject({
      tsconfigPath,
      checkerOptions: {
        schema: {
          externalSymbolLinkMappings: {
            typescript: {
              HTMLElement: elementUrl,
            },
          },
        },
      },
    });

    const { component } = project.service.getComponentMeta(entry, 'Foo');
    const props = toRecord(component.props);
    expect(props['dom'].schema).toMatchObject({
      kind: 'ref',
      externalUrl: elementUrl,
    });
  });
  test('disableExternalLinkAutoDectect', () => {
    project = createProject({
      tsconfigPath,
      checkerOptions: {
        schema: {
          disableExternalLinkAutoDectect: true,
        },
      },
    });

    const { component } = project.service.getComponentMeta(entry, 'Foo');
    const props = toRecord(component.props);
    expect(props['dom'].schema).toMatchObject({
      kind: 'unknown',
    });
  });
  afterEach(() => {
    project.close();
  });
});
