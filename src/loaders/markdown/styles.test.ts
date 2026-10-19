import fs from 'fs';
import Module from 'module';
import os from 'os';
import path from 'path';
import { vi } from 'vitest';

let mdLoader: typeof import('.')['default'];
let ReactTechStack: typeof import('../../techStacks/react')['default'];
const fixtureDirs: string[] = [];

beforeAll(async () => {
  const extensions = (Module as any)._extensions as NodeJS.RequireExtensions;
  extensions['.ts'] ??= extensions['.js'];
  mdLoader = (await import('.')).default;
  ReactTechStack = (await import('../../techStacks/react')).default;
});

beforeEach(() => {
  vi.stubEnv('DUMI_CACHE', 'none');
});

afterEach(() => {
  vi.unstubAllEnvs();
  fixtureDirs.splice(0).forEach((dir) => {
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

function createFixture(files: Record<string, string>) {
  const dir = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-demo-styles-')),
  );
  fixtureDirs.push(dir);
  Object.entries(files).forEach(([filename, content]) => {
    const file = path.join(dir, filename);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  });
  fs.writeFileSync(
    path.join(dir, 'loader-context.cjs'),
    'module.exports = {};',
  );
  return dir;
}

function loadDemos(dir: string, disableLiveDemo = false) {
  const resourcePath = path.join(dir, 'index.md');
  const dependencies: string[] = [];
  return new Promise<{ output: string; dependencies: string[] }>(
    (resolve, reject) => {
      mdLoader.call(
        {
          resourcePath,
          resourceQuery: '?type=demo',
          getOptions: () => ({
            cwd: dir,
            mode: 'demo',
            techStacks: [new ReactTechStack()],
            resolve: {
              codeBlockMode: 'active',
              atomDirs: [],
              docDirs: [],
            },
            alias: {},
            locales: [],
            routes: {},
            pkg: {},
            disableLiveDemo,
            __dumiLoaderContextPath: path.join(dir, 'loader-context.cjs'),
          }),
          addDependency: (file: string) => dependencies.push(file),
          async: () => (error: Error | null, output: string) => {
            if (error) reject(error);
            else resolve({ output, dependencies });
          },
        },
        fs.readFileSync(resourcePath, 'utf-8'),
      );
    },
  );
}

function evaluateDemos(output: string) {
  const namespaceImports = Array.from(
    output.matchAll(/^import \* as (\w+) from '([^']+)';$/gm),
  );
  const namespaces = Object.fromEntries(
    namespaceImports.map(([, , source]) => [source, { default: source }]),
  );
  const source = output
    .replace(/^import .*;$/gm, '')
    .replace('export const demos', 'const demos');
  const demos = new Function(
    'React',
    'require',
    ...namespaceImports.map(([, specifier]) => specifier),
    `${source}\nreturn demos;`,
  )(
    {
      lazy: (loader: unknown) => loader,
      memo: (component: unknown) => component,
    },
    (request: string) => ({
      default: fs.readFileSync(
        request.replace(/^-!/, '').split('?')[0],
        'utf-8',
      ),
    }),
    ...namespaceImports.map(([, , imported]) => namespaces[imported]),
  );
  return { demos: Object.values(demos) as any[], namespaces };
}

test('live demo styles retain CSS and source assets without reading exports', async () => {
  const styles = Object.fromEntries(
    ['css', 'less', 'sass', 'scss', 'styl'].map((ext) => [
      `style.${ext}`,
      `.demo-${ext} { color: red; }`,
    ]),
  );
  const dir = createFixture({
    'index.md': '<code src="./demo.tsx"></code>',
    'demo.tsx': `${Object.keys(styles)
      .map((file) => `import './${file}';`)
      .join('\n')}\nexport default () => null;`,
    ...styles,
  });
  const { output, dependencies } = await loadDemos(dir);
  const { demos } = evaluateDemos(output);

  Object.entries(styles).forEach(([file, content]) => {
    const absolute = path.join(dir, file);
    expect(output).toContain(`import '${absolute}';`);
    expect(output).not.toMatch(
      new RegExp(
        `import \\* as [^;]+ from '${absolute.replace(/\./g, '\\.')}'`,
      ),
    );
    expect(demos[0].context[`./${file}`]).toEqual({});
    expect(demos[0].context[absolute]).toEqual({});
    expect(demos[0].asset.dependencies[`./${file}`].value).toBe(content);
    expect(dependencies).toContain(absolute);
  });
});

test('live demo CSS Modules and JavaScript or JSON dependencies retain exports', async () => {
  const dir = createFixture({
    'index.md': '<code src="./demo.tsx"></code>',
    'demo.tsx': [
      "import styles from './style.module.less';",
      "import data from './data.json';",
      "import { value } from './helper';",
      'export default () => <div className={styles.demo}>{data.label}{value}</div>;',
    ].join('\n'),
    'style.module.less': '.demo { color: red; }',
    'data.json': '{"label":"demo"}',
    'helper.ts': 'export const value = 1;',
  });
  const { output } = await loadDemos(dir);
  const { demos, namespaces } = evaluateDemos(output);

  ['style.module.less', 'data.json', 'helper.ts'].forEach((file) => {
    const absolute = path.join(dir, file);
    expect(namespaces[absolute]).toBeDefined();
    expect(demos[0].context[absolute]).toBe(namespaces[absolute]);
    expect(demos[0].context[`./${file}`]).toBe(namespaces[absolute]);
  });
});

test('nested and shared live demo styles are deduplicated and respect disableLiveDemo', async () => {
  const dir = createFixture({
    'index.md': [
      '<code src="./first.tsx"></code>',
      '',
      '<code src="./second.tsx"></code>',
    ].join('\n'),
    'first.tsx': [
      "import './shared.less';",
      "import Child from './nested/Child';",
      'export default () => <Child />;',
    ].join('\n'),
    'second.tsx': "import './shared.less';\nexport default () => null;",
    'shared.less': '.shared { color: red; }',
    'nested/Child.tsx': "import './nested.less';\nexport default () => null;",
    'nested/nested.less': '.nested { color: blue; }',
  });
  const { output } = await loadDemos(dir);
  const sharedImport = `import '${path.join(dir, 'shared.less')}';`;
  expect(output.split(sharedImport)).toHaveLength(2);
  expect(output).toContain(`import '${path.join(dir, 'nested/nested.less')}';`);
  const { demos } = evaluateDemos(output);
  expect(demos).toHaveLength(2);
  demos.forEach((demo) => {
    expect(demo.context['./shared.less']).toEqual({});
  });
  expect(demos[0].context['./nested.less']).toEqual({});

  const { output: disabledOutput } = await loadDemos(dir, true);
  expect(disabledOutput).not.toContain(sharedImport);
  expect(disabledOutput).not.toContain('import * as ');
  evaluateDemos(disabledOutput).demos.forEach((demo) => {
    expect(demo.context).toBeUndefined();
    expect(demo.asset.dependencies['./shared.less'].value).toBe(
      '.shared { color: red; }',
    );
  });
});
