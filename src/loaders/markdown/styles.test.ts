import type { IDumiTechStack } from '@/types';
import fs from 'fs';
import Module from 'module';
import os from 'os';
import path from 'path';
import { transform } from 'sucrase';
import { winPath } from 'umi/plugin-utils';
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

function loadDemos(
  dir: string,
  disableLiveDemo = false,
  techStack?: IDumiTechStack,
  useUtoopack = true,
) {
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
            techStacks: [techStack ?? new ReactTechStack()],
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
            ...(useUtoopack
              ? {
                  __dumiLoaderContextPath: path.join(dir, 'loader-context.cjs'),
                }
              : {}),
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

function evaluateDemos(
  output: string,
  importedNamespaces: Record<string, unknown> = {},
) {
  const namespaceImports = Array.from(
    output.matchAll(/^import \* as (\w+) from '([^']+)';$/gm),
  );
  const namespaces = Object.fromEntries(
    namespaceImports.map(([, , source]) => [
      source,
      importedNamespaces[source] ?? { default: source },
    ]),
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
    const absolute = winPath(path.join(dir, file));
    expect(output).toContain(`import '${absolute}';`);
    expect(output).not.toMatch(
      new RegExp(
        `import \\* as [^;]+ from '${absolute.replace(/\./g, '\\.')}'`,
      ),
    );
    expect(demos[0].context[`./${file}`]).toEqual({});
    expect(demos[0].context[absolute]).toEqual({});
    expect(demos[0].asset.dependencies[`./${file}`].value).toBe(content);
    expect(dependencies.map(winPath)).toContain(absolute);
  });
});

test('webpack retains existing stylesheet namespaces for side-effect imports', async () => {
  const dir = createFixture({
    'index.md': '<code src="./demo.tsx"></code>',
    'demo.tsx': [
      "import './style.less';",
      "import './style.css';",
      'export default () => null;',
    ].join('\n'),
    'style.less': '.less { color: red; }',
    'style.css': '.css { color: blue; }',
  });
  const { output } = await loadDemos(dir, false, undefined, false);
  const { demos, namespaces } = evaluateDemos(output);

  ['style.less', 'style.css'].forEach((file) => {
    const absolute = winPath(path.join(dir, file));
    expect(namespaces[absolute]).toBeDefined();
    expect(output).not.toContain(`import '${absolute}';`);
    expect(demos[0].context[`./${file}`]).toBe(namespaces[absolute]);
    expect(demos[0].context[absolute]).toBe(namespaces[absolute]);
  });
});

test('live demo dependency analysis uses aliases from the generated loader context', async () => {
  const dir = createFixture({
    'package.json': JSON.stringify({ name: 'fixture-docs', version: '1.0.0' }),
    'index.md': '<code src="./demo.tsx"></code>',
    'demo.tsx': [
      "import './style.less';",
      "import { value } from '@fixture/helper';",
      'export default () => value;',
    ].join('\n'),
    'helper.ts': 'export const value = 1;',
    'style.less': '.demo { color: red; }',
  });
  fs.writeFileSync(
    path.join(dir, 'loader-context.cjs'),
    `exports.alias = ${JSON.stringify({ '@fixture': dir })};`,
  );
  const absolute = winPath(path.join(dir, 'style.less'));
  const { output } = await loadDemos(dir);
  const { demos, namespaces } = evaluateDemos(output);

  expect(output).toContain(`import '${absolute}';`);
  expect(demos[0].context['./style.less']).toEqual({});
  expect(namespaces['@fixture/helper']).toBeDefined();
  expect(demos[0].context['@fixture/helper']).toBe(
    namespaces['@fixture/helper'],
  );
});

test.each([
  {
    name: 'default import',
    style: 'style.less',
    code: "import sheet from './style.less';\nexport default () => sheet;",
  },
  {
    name: 'named import',
    style: 'style.css',
    code: "import { use } from './style.css';\nexport default () => use;",
  },
  {
    name: 'namespace import',
    style: 'style.less',
    code: "import * as sheet from './style.less';\nexport default () => sheet;",
  },
  {
    name: 'named re-export',
    style: 'style.css',
    code: "export { default as sheet } from './style.css';\nexport default () => null;",
  },
  {
    name: 'namespace re-export',
    style: 'style.less',
    code: "export * as sheet from './style.less';\nexport default () => null;",
  },
  {
    name: 'star re-export',
    style: 'style.css',
    code: "export * from './style.css';\nexport default () => null;",
  },
  {
    name: 'require call',
    style: 'style.less',
    code: "const sheet = require('./style.less');\nexport default () => sheet;",
  },
  {
    name: 'dynamic import',
    style: 'style.css',
    code: "const load = () => import('./style.css');\nexport default () => load;",
  },
])(
  'live demo preserves stylesheet exports for $name',
  async ({ style, code }) => {
    const dir = createFixture({
      'index.md': '<code src="./demo.tsx"></code>',
      'demo.tsx': code,
      [style]: '.demo { color: red; }',
    });
    const absolute = winPath(path.join(dir, style));
    const { output } = await loadDemos(dir);
    const { demos, namespaces } = evaluateDemos(output);

    expect(namespaces[absolute]).toBeDefined();
    expect(output).not.toContain(`import '${absolute}';`);
    expect(demos[0].context[`./${style}`]).toBe(namespaces[absolute]);
    expect(demos[0].context[absolute]).toBe(namespaces[absolute]);
  },
);

test.each([true, false])(
  'value imports take priority over side-effect imports in one file (side effect first: %s)',
  async (sideEffectFirst) => {
    const sideEffectImport = "import './style.less';";
    const valueImport = "import sheet from './style.less';";
    const imports = sideEffectFirst
      ? [sideEffectImport, valueImport]
      : [valueImport, sideEffectImport];
    const dir = createFixture({
      'index.md': '<code src="./demo.tsx"></code>',
      'demo.tsx': [...imports, 'export default () => sheet;'].join('\n'),
      'style.less': '.demo { color: red; }',
    });
    const absolute = winPath(path.join(dir, 'style.less'));
    const { output } = await loadDemos(dir);
    const { demos, namespaces } = evaluateDemos(output);

    expect(namespaces[absolute]).toBeDefined();
    expect(output).not.toContain(`import '${absolute}';`);
    expect(demos[0].context['./style.less']).toBe(namespaces[absolute]);
  },
);

test.each([true, false])(
  'shared stylesheet exports survive side-effect imports from another demo (side effect first: %s)',
  async (sideEffectFirst) => {
    const files = sideEffectFirst
      ? ['side-effect', 'value']
      : ['value', 'side-effect'];
    const dir = createFixture({
      'index.md': files
        .map((file) => `<code src="./${file}.tsx"></code>`)
        .join('\n\n'),
      'side-effect.tsx': "import './style.less';\nexport default () => null;",
      'value.tsx':
        "import sheet from './style.less';\nexport default () => sheet;",
      'style.less': '.demo { color: red; }',
    });
    const absolute = winPath(path.join(dir, 'style.less'));
    const { output } = await loadDemos(dir);
    const { demos, namespaces } = evaluateDemos(output);
    const styleImports = Array.from(
      output.matchAll(/^import \* as (\w+) from '([^']+)';$/gm),
    ).filter(([, , source]) => source === absolute);

    expect(styleImports).toHaveLength(1);
    expect(namespaces[absolute]).toBeDefined();
    expect(output).not.toContain(`import '${absolute}';`);
    expect(demos).toHaveLength(2);
    demos.forEach((demo) => {
      expect(demo.context['./style.less']).toBe(namespaces[absolute]);
    });
  },
);

test('value imports in nested dependencies retain stylesheet exports', async () => {
  const dir = createFixture({
    'index.md': '<code src="./demo.tsx"></code>',
    'demo.tsx': [
      "import './style.less';",
      "import { sheet } from './nested/helper';",
      'export default () => sheet;',
    ].join('\n'),
    'nested/helper.ts': "import sheet from '../style.less';\nexport { sheet };",
    'style.less': '.demo { color: red; }',
  });
  const absolute = winPath(path.join(dir, 'style.less'));
  const { output } = await loadDemos(dir);
  const { demos, namespaces } = evaluateDemos(output);

  expect(namespaces[absolute]).toBeDefined();
  expect(output).not.toContain(`import '${absolute}';`);
  expect(demos[0].context[absolute]).toBe(namespaces[absolute]);
});

test.each(['tsx', 'vue'])(
  'onBlockLoad retains stylesheet bindings injected into transformed %s demos',
  async (extension) => {
    const originalCode = "import './style.less';\nexport default () => null;";
    const dir = createFixture({
      'index.md': `<code src="./demo.${extension}"></code>`,
      [`demo.${extension}`]:
        extension === 'vue' ? `<script>${originalCode}</script>` : originalCode,
      'style.less': '.demo { color: red; }',
    });
    const techStack: IDumiTechStack = new ReactTechStack();
    techStack.isSupported = (_, lang) => lang === extension;
    techStack.onBlockLoad = vi.fn((args) => {
      if (!args.path.endsWith(`.${extension}`)) return null;
      return {
        type: 'tsx',
        content: [
          "import './style.less';",
          "import sheet from './style.less';",
          'export default () => <div>{sheet}</div>;',
        ].join('\n'),
      };
    });
    const absolute = winPath(path.join(dir, 'style.less'));
    const { output } = await loadDemos(dir, false, techStack);
    const { demos, namespaces } = evaluateDemos(output);

    expect(techStack.onBlockLoad).toHaveBeenCalled();
    expect(namespaces[absolute]).toBeDefined();
    expect(output).not.toContain(`import '${absolute}';`);
    expect(demos[0].context['./style.less']).toBe(namespaces[absolute]);
  },
);

test('generateSources retains stylesheet namespaces when taking over dependency mappings', async () => {
  const dir = createFixture({
    'index.md': '<code src="./demo.tsx"></code>',
    'demo.tsx': "import './style.less';\nexport default () => null;",
    'style.less': '.demo { color: red; }',
  });
  const techStack: IDumiTechStack = new ReactTechStack();
  techStack.generateSources = vi.fn((sources) => ({ ...sources }));
  const absolute = winPath(path.join(dir, 'style.less'));
  const { output } = await loadDemos(dir, false, techStack);
  const { demos, namespaces } = evaluateDemos(output);

  expect(techStack.generateSources).toHaveBeenCalled();
  expect(namespaces[absolute]).toBeDefined();
  expect(output).not.toContain(`import '${absolute}';`);
  expect(demos[0].context['./style.less']).toBe(namespaces[absolute]);
});

test.each([true, false])(
  'live demo compilation preserves lazy style-loader APIs and module metadata (utoopack: %s)',
  async (useUtoopack) => {
    const dir = createFixture({
      'index.md': '<code src="./demo.tsx"></code>',
      'demo.tsx': [
        "import sheet from './style.less';",
        "import * as sheetNamespace from './style.less';",
        "import { theme } from './style.less';",
        'sheet.use();',
        'sheetNamespace.default.unuse();',
        'export const details = {',
        '  sameDefault: sheet === sheetNamespace.default,',
        '  theme,',
        '  esModule: sheetNamespace.__esModule,',
        '  tag: Object.prototype.toString.call(sheetNamespace),',
        '};',
        'export default () => null;',
      ].join('\n'),
      'style.less': '.demo { color: red; }',
    });
    const sheet = { use: vi.fn(), unuse: vi.fn() };
    const styleNamespace = Object.assign(Object.create(null), {
      default: sheet,
      theme: 'lazy-style',
    });
    Object.defineProperty(styleNamespace, '__esModule', { value: true });
    Object.defineProperty(styleNamespace, Symbol.toStringTag, {
      value: 'Module',
    });
    const { output } = await loadDemos(dir, false, undefined, useUtoopack);
    const { demos } = evaluateDemos(output, {
      [winPath(path.join(dir, 'style.less'))]: styleNamespace,
    });
    const liveCode = transform(demos[0].asset.dependencies['index.tsx'].value, {
      transforms: ['typescript', 'jsx', 'imports'],
    }).code;
    const exports: Record<string, unknown> = {};
    new Function('exports', 'module', 'require', liveCode)(
      exports,
      { exports },
      (source: string) => demos[0].context[source],
    );

    expect(sheet.use).toHaveBeenCalledOnce();
    expect(sheet.unuse).toHaveBeenCalledOnce();
    expect(exports.details).toEqual({
      sameDefault: true,
      theme: 'lazy-style',
      esModule: true,
      tag: '[object Module]',
    });
    expect(demos[0].context['./style.less']).toBe(styleNamespace);
    expect(demos[0].context['./style.less'].__esModule).toBe(true);
    expect(
      Object.prototype.toString.call(demos[0].context['./style.less']),
    ).toBe('[object Module]');
  },
);

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
    const absolute = winPath(path.join(dir, file));
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
  const sharedImport = `import '${winPath(path.join(dir, 'shared.less'))}';`;
  expect(output.split(sharedImport)).toHaveLength(2);
  expect(output).toContain(
    `import '${winPath(path.join(dir, 'nested/nested.less'))}';`,
  );
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
