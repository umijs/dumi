import path from 'node:path/posix';
import { afterAll, afterEach, beforeAll, describe, expect, test } from 'vitest';
import { Project, createProject } from '../src/index';
import { getPosixPath } from '../src/utils';
import { entry, fixturesPath, rootPath, toRecord, tsconfigPath } from './utils';

describe('project file manipulation', () => {
  // TODO: should use vitual filesystem, and should mock partial filesystem
  let project!: Project;

  beforeAll(() => {
    project = createProject({
      tsconfigPath,
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
    project && project.close();
  });
});

describe('create project api', () => {
  let project!: Project;

  test('create without parameters', () => {
    project = createProject();
    expect((project as any).rootPath).toBe(getPosixPath(process.cwd()));
  });

  test('create with rootPath', () => {
    project = createProject(fixturesPath);
    expect(project.getService().getExportNames(entry)).toContain('Foo');
  });

  test('create with tsconfigPath', () => {
    project = createProject({
      tsconfigPath,
    });
    expect((project as any).rootPath).toBe(
      path.dirname(getPosixPath(tsconfigPath)),
    );
  });

  test('create with tsconfigPath and rootPath', () => {
    project = createProject({
      rootPath,
      tsconfigPath,
    });
    expect((project as any).rootPath).toBe(getPosixPath(rootPath));
    expect((project as any).globalComponentName).toBe(
      getPosixPath(tsconfigPath) + '.global.vue',
    );
  });

  test('ensure correct tsconfig path', () => {
    expect(() =>
      createProject({
        rootPath,
        tsconfigPath: path.join(rootPath, 'tsconfig.vue.json'),
      }),
    ).toThrowError(/no such file or directory/);
  });

  afterEach(() => {
    project && project.close();
  });
});

describe('schema config', () => {
  let project!: Project;
  test('externalSymbolLinkMappings', () => {
    const elementUrl = 'https://devdocs.io/dom/htmlelement';
    project = createProject({
      tsconfigPath,
      checkerOptions: {
        externalSymbolLinkMappings: {
          typescript: {
            HTMLElement: elementUrl,
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
        disableExternalLinkAutoDectect: true,
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
