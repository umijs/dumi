import type { IDumiTechStack } from '@/types';
import glob from 'fast-glob';
import fs from 'fs';
import path from 'path';
import transformer from '.';

const CASES_DIR = path.join(__dirname, 'fixtures');
const cases = glob
  .sync('**/index.md', { cwd: CASES_DIR, deep: 3 })
  .map((file) => path.dirname(file));

class FakeTechStack implements IDumiTechStack {
  name = 'fake';

  isSupported(...[, lang]: Parameters<IDumiTechStack['isSupported']>) {
    return lang === 'jsx';
  }

  transformCode(...[raw, opts]: Parameters<IDumiTechStack['transformCode']>) {
    return opts.type === 'code-block' ? "() => 'Fake'" : raw;
  }
}

class SharedPreviewerPropsTechStack extends FakeTechStack {
  generatePreviewerProps(props: Record<string, unknown>) {
    return {
      ...props,
      dependencyVersions: {
        react: 'x'.repeat(1100),
      },
    };
  }
}

function getTransformerOptions(
  fileAbsPath: string,
  useUtoopackDemoHMR?: boolean,
) {
  return {
    techStacks: [new FakeTechStack()],
    cwd: path.dirname(fileAbsPath),
    fileAbsPath,
    ...(useUtoopackDemoHMR === undefined ? {} : { useUtoopackDemoHMR }),
    resolve: {
      codeBlockMode: 'active' as const,
      atomDirs: [],
      docDirs: [],
      forceKebabCaseRouting: true,
    },
    locales: [],
    routes: {},
    pkg: {},
    alias: {
      '@': __dirname,
    },
  };
}

for (let casePath of cases) {
  test(`markdown transformer: ${casePath}`, async () => {
    const fileAbsPath = path.join(CASES_DIR, casePath, 'index.md');
    const content = fs.readFileSync(fileAbsPath, 'utf8');
    const ret = await transformer(
      content,
      getTransformerOptions(fileAbsPath, true),
    );

    (await import(`${CASES_DIR}/${casePath}/expect.ts`)).default(ret);
  });
}

test('markdown transformer: skips local demo loader by default', async () => {
  const fileAbsPath = path.join(CASES_DIR, 'demo', 'index.md');
  const content = fs.readFileSync(fileAbsPath, 'utf8');
  const ret = await transformer(content, getTransformerOptions(fileAbsPath));

  expect(ret.content).not.toContain('"loader": () => import');
  expect(ret.content).not.toContain('"version":');
});

test('markdown transformer: hoists repeated large demo props for utoopack HMR', async () => {
  const fileAbsPath = path.join(CASES_DIR, 'demo', 'shared-props.md');
  const content = [
    '```jsx',
    'export default () => <>First</>;',
    '```',
    '',
    '```jsx',
    'export default () => <>Second</>;',
    '```',
  ].join('\n');
  const ret = await transformer(content, {
    ...getTransformerOptions(fileAbsPath, true),
    techStacks: [new SharedPreviewerPropsTechStack()],
  });

  expect(ret.meta.demoSharedProps).toEqual([{ react: 'x'.repeat(1100) }]);
  expect(ret.content.match(/__dumi_demo_shared_props__\[0\]/g)).toHaveLength(2);
  expect(ret.content).not.toContain('x'.repeat(100));
});

describe('markdown transformer: custom anchor', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  const transform = (raw: string) =>
    transformer(
      raw,
      getTransformerOptions(path.join(CASES_DIR, 'normal/index.md')),
    );

  const toHaveWarned = (message: string) =>
    expect(warn).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining(message),
    );

  const demoBlock = [
    '```jsx',
    '/**',
    ' * title: Demo Title',
    ' */',
    'export default () => 1;',
    '```',
  ].join('\n');

  const getDemoId = async () => (await transform(demoBlock)).meta.toc![0].id;

  test('explicit anchor wins over auto-generated slug', async () => {
    const ret = await transform(['## foo', '', '## bar {#foo}'].join('\n'));

    expect(ret.meta.toc).toEqual([
      { id: 'foo-1', depth: 2, title: 'foo' },
      { id: 'foo', depth: 2, title: 'bar' },
    ]);
    toHaveWarned('conflicts with the anchor "foo"');
  });

  test('duplicate explicit anchors fallback with suffix', async () => {
    const ret = await transform(['## a {#dup}', '', '## b {#dup}'].join('\n'));

    expect(ret.meta.toc).toEqual([
      { id: 'dup', depth: 2, title: 'a' },
      { id: 'dup-1', depth: 2, title: 'b' },
    ]);
    toHaveWarned('Custom anchor "dup" is duplicated');
  });

  test('custom anchor is used as-is without slugging', async () => {
    const ret = await transform('## a {#Foo.Bar}');

    expect(ret.meta.toc).toEqual([{ id: 'Foo.Bar', depth: 2, title: 'a' }]);
    expect(ret.content).toContain('id="Foo.Bar"');
    expect(warn).not.toHaveBeenCalled();
  });

  test.each([
    ['before', ['## a {#hello}', '', '<h3 id="hello">x</h3>']],
    ['after', ['<h3 id="hello">x</h3>', '', '## a {#hello}']],
  ])('custom anchor gives way to an existing id %s it', async (_, lines) => {
    const ret = await transform(lines.join('\n'));
    const ids = ret.meta.toc!.map(({ id }) => id);

    expect(ids).toContain('hello');
    expect(ids).toContain('hello-1');
    expect(ret.meta.toc!.find(({ id }) => id === 'hello')!.title).toBe('x');
    toHaveWarned('conflicts with an existing heading id');
  });

  test('marker overrides the id written in raw html', async () => {
    const ret = await transform('<h3 id="raw-id">a {#other}</h3>');

    expect(ret.meta.toc).toEqual([{ id: 'other', depth: 3, title: 'a' }]);
    expect(ret.content).toContain('id="other"');
    expect(ret.content).not.toContain('id="raw-id"');
    expect(ret.content).not.toContain('{#other}');
    toHaveWarned('overrides the existing id "raw-id"');
  });

  test('no warning when the marker equals the existing id', async () => {
    const ret = await transform('<h3 id="same">a {#same}</h3>');

    expect(ret.meta.toc).toEqual([{ id: 'same', depth: 3, title: 'a' }]);
    expect(warn).not.toHaveBeenCalled();
  });

  test('auto slug gives way to an existing id', async () => {
    const ret = await transform(
      ['## Hello', '', '<h3 id="hello">x</h3>'].join('\n'),
    );

    expect(ret.meta.toc).toEqual([
      { id: 'hello-1', depth: 2, title: 'Hello' },
      { id: 'hello', depth: 3, title: 'x' },
    ]);
  });

  test('marker tolerates trailing whitespace', async () => {
    const ret = await transform(
      ['<h3>a {#other} </h3>', '', '## b {#b}\t', '', '## c {#c}'].join('\n'),
    );

    expect(ret.meta.toc).toEqual([
      { id: 'other', depth: 3, title: 'a' },
      { id: 'b', depth: 2, title: 'b' },
      { id: 'c', depth: 2, title: 'c' },
    ]);
    expect(ret.content).not.toContain('{#');
  });

  test('marker in the middle of heading stays as text', async () => {
    const ret = await transform('## Use {#id} syntax');

    expect(ret.meta.toc).toEqual([
      { id: 'use-id-syntax', depth: 2, title: 'Use {#id} syntax' },
    ]);
    expect(ret.content).toContain('{#id}');
  });

  test('default title derived from heading ignores the marker', async () => {
    const ret = await transform('# User Guide {#guide}');

    expect(ret.meta.frontmatter!.title).toBe('User Guide');
    expect(ret.meta.toc).toEqual([
      { id: 'guide', depth: 1, title: 'User Guide' },
    ]);
    expect(ret.content).not.toContain('{#guide}');
    expect(warn).not.toHaveBeenCalled();
  });

  test('explicit frontmatter title is kept for heading with marker', async () => {
    const ret = await transform(
      ['---', 'title: Explicit Title', '---', '', '# User Guide {#guide}'].join(
        '\n',
      ),
    );

    expect(ret.meta.frontmatter!.title).toBe('Explicit Title');
    expect(ret.meta.toc).toEqual([
      { id: 'guide', depth: 1, title: 'User Guide' },
    ]);
  });

  test('blank marker is kept as plain text everywhere', async () => {
    const ret = await transform('# User Guide {# }');

    expect(ret.meta.frontmatter!.title).toBe('User Guide {# }');
    expect(ret.meta.toc).toEqual([
      { id: expect.any(String), depth: 1, title: 'User Guide {# }' },
    ]);
    expect(ret.content).toContain('{# }');
  });

  describe('heading with an existing id', () => {
    const pluginSetId = (id: string) => () => (tree: any) => {
      const walk = (node: any) => {
        if (node.type === 'heading' && node.depth === 1) {
          node.data ??= {};
          node.data.hProperties = { id };
        }
        node.children?.forEach(walk);
      };

      walk(tree);
    };

    const transformWithId = (raw: string, id = 'plugin-set-id') =>
      transformer(raw, {
        ...getTransformerOptions(path.join(CASES_DIR, 'normal/index.md')),
        extraRemarkPlugins: [pluginSetId(id)],
      });

    test('marker overrides the id set by another plugin', async () => {
      const ret = await transformWithId('# User Guide {#guide}');

      expect(ret.meta.frontmatter!.title).toBe('User Guide');
      expect(ret.meta.toc).toEqual([
        { id: 'guide', depth: 1, title: 'User Guide' },
      ]);
      expect(ret.content).toContain('id="guide"');
      expect(ret.content).not.toContain('{#guide}');
      toHaveWarned('overrides the existing id "plugin-set-id"');
    });

    test('explicit frontmatter title still wins', async () => {
      const ret = await transformWithId(
        [
          '---',
          'title: Explicit Title',
          '---',
          '',
          '# User Guide {#guide}',
        ].join('\n'),
      );

      expect(ret.meta.frontmatter!.title).toBe('Explicit Title');
      expect(ret.meta.toc).toEqual([
        { id: 'guide', depth: 1, title: 'User Guide' },
      ]);
    });
  });

  test('custom anchor gives way to demo anchor', async () => {
    const demoId = await getDemoId();
    const ret = await transform(
      [`# Demo {#${demoId}}`, '', demoBlock].join('\n'),
    );
    const toc = ret.meta.toc!;

    expect(toc).toEqual([
      { id: `${demoId}-1`, depth: 1, title: 'Demo' },
      { id: demoId, depth: 3, title: 'Demo Title' },
    ]);
    expect(new Set(toc.map(({ id }) => id)).size).toBe(toc.length);
    toHaveWarned('conflicts with demo id');
  });

  test('auto slug gives way to demo anchor before it', async () => {
    const demoId = await getDemoId();
    const ret = await transform(['## Demo 0', '', demoBlock].join('\n'));

    expect(ret.meta.toc).toEqual([
      { id: `${demoId}-1`, depth: 2, title: 'Demo 0' },
      { id: demoId, depth: 3, title: 'Demo Title' },
    ]);
  });
});
