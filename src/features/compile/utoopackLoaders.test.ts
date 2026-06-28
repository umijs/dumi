import Module from 'module';
import { vi } from 'vitest';

function registerTsResolveExtension() {
  const extensions = (Module as any)._extensions as NodeJS.RequireExtensions;

  extensions['.ts'] ??= extensions['.js'];
}

function createApi() {
  return {
    cwd: '/tmp/dumi-app',
    paths: {
      absTmpPath: '/tmp/dumi-app/.dumi/tmp',
    },
    config: {
      alias: {},
      locales: [],
      resolve: {},
    },
    userConfig: {},
    pkg: {},
  } as any;
}

test('utoopack preserves external demo source language for parsing', async () => {
  registerTsResolveExtension();

  const { getUtoopackRules } = await import('./utoopackLoaders');
  const rules = getUtoopackRules(createApi());
  const wildcardRules = rules['**/*'] as any[];

  const findDemoRuleByPath = (path: string) =>
    wildcardRules.find((rule) =>
      rule.condition?.all?.some(
        (condition: any) => String(condition.path) === path,
      ),
    );

  expect(findDemoRuleByPath('/\\.tsx$/')).toMatchObject({
    as: '*.tsx',
  });
  expect(findDemoRuleByPath('/\\.ts$/')).toMatchObject({
    as: '*.ts',
  });
  expect(findDemoRuleByPath('/\\.jsx$/')).toMatchObject({
    as: '*.jsx',
  });

  const fallbackDemoRule = wildcardRules.find((rule) =>
    rule.condition?.all?.some(
      (condition: any) => String(condition.not?.path) === '/\\.(tsx?|jsx)$/',
    ),
  );
  expect(fallbackDemoRule).toMatchObject({
    as: '*.js',
  });
  expect(
    fallbackDemoRule.condition.all.some(
      (condition: any) => String(condition.query) === '/^\\?techStack=.*$/',
    ),
  ).toBe(true);
});

test('utoopack markdown rules use current config memo', async () => {
  registerTsResolveExtension();

  const { getUtoopackRules } = await import('./utoopackLoaders');
  const api = createApi();
  const rules = getUtoopackRules(api, {
    ...api.config,
    alias: {
      antd: '/tmp/dumi-app/components',
    },
    locales: [{ id: 'en-US', name: 'English', suffix: '' }],
    resolve: {
      atomDirs: [{ type: 'component', dir: 'components' }],
      docDirs: [{ type: 'doc', dir: 'docs' }],
      codeBlockMode: 'passive',
      forceKebabCaseRouting: false,
    },
  });

  const mdRules = rules['*.md'] as any[];
  const defaultMdRule = mdRules.find((rule) => !rule.condition);
  const defaultMdOptions = defaultMdRule.loaders[0].options;

  expect(defaultMdOptions.alias).toEqual({
    antd: '/tmp/dumi-app/components',
  });
  expect(defaultMdOptions.locales).toEqual([
    { id: 'en-US', name: 'English', suffix: '' },
  ]);
  expect(defaultMdOptions.resolve).toMatchObject({
    atomDirs: [{ type: 'component', dir: 'components' }],
    docDirs: [{ type: 'doc', dir: 'docs' }],
    codeBlockMode: 'passive',
    forceKebabCaseRouting: false,
  });
});

test('utoopack loader context serializes extra unified plugins', async () => {
  const plugins = require('./fixtures/unifiedPlugins.cjs');
  const { buildLoaderContextContent } = await import('./utoopackLoaders');
  const content = buildLoaderContextContent(
    [],
    {},
    {},
    [plugins.remarkPluginForTest, ['remark-string-plugin', { value: 1 }]],
    [[plugins.rehypePluginForTest, { enabled: true }], 'rehype-string-plugin'],
  );
  const exports: any = {};

  new Function('require', 'exports', content)(require, exports);

  expect(exports.extraRemarkPlugins).toEqual([
    plugins.remarkPluginForTest,
    ['remark-string-plugin', { value: 1 }],
  ]);
  expect(exports.extraRehypePlugins).toEqual([
    [plugins.rehypePluginForTest, { enabled: true }],
    'rehype-string-plugin',
  ]);
});

test('utoopack loader context registers TS hook without project root phantom deps', async () => {
  const { buildLoaderContextContent } = await import('./utoopackLoaders');
  const content = buildLoaderContextContent([]);
  const exports: any = {};
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const requireWithoutProjectDeps = (id: string) => {
    if (id.startsWith('@umijs/')) {
      throw new Error(`Unexpected project-root dependency: ${id}`);
    }

    return require(id);
  };

  expect(content).not.toContain(`require('@umijs/utils')`);
  expect(content).not.toContain(
    `require('@umijs/bundler-utils/compiled/esbuild')`,
  );
  expect(content).toContain(
    `require(${JSON.stringify(require.resolve('@umijs/utils'))})`,
  );
  expect(content).toContain(
    `require(${JSON.stringify(
      require.resolve('@umijs/bundler-utils/compiled/esbuild'),
    )})`,
  );

  try {
    new Function('require', 'exports', content)(
      requireWithoutProjectDeps,
      exports,
    );
    expect(warn).not.toHaveBeenCalled();
  } finally {
    warn.mockRestore();
  }
});

test('utoopack loader context resolves plugins from config source files', async () => {
  registerTsResolveExtension();

  const pluginPath = require.resolve('./fixtures/cacheClearedPlugin.ts');
  const plugins = require(pluginPath);
  const { buildLoaderContextContent } = await import('./utoopackLoaders');

  delete require.cache[pluginPath];

  const content = buildLoaderContextContent(
    [],
    {},
    {},
    [plugins.default],
    [plugins.namedCacheClearedPlugin],
    [pluginPath],
  );
  const exports: any = {};

  new Function('require', 'exports', content)(require, exports);

  expect(exports.extraRemarkPlugins[0]).toBe(require(pluginPath).default);
  expect(exports.extraRehypePlugins[0]).toBe(
    require(pluginPath).namedCacheClearedPlugin,
  );
});
