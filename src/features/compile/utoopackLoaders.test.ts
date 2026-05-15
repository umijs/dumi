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
