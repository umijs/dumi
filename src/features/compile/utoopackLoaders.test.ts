import Module from 'module';

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
