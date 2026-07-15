import Module from 'module';

function registerTsResolveExtension() {
  const extensions = (Module as any)._extensions as NodeJS.RequireExtensions;

  extensions['.ts'] ??= extensions['.js'];
}

test.each([
  ['development', true, undefined],
  ['test', true, undefined],
  ['production', false, undefined],
  [
    'production',
    true,
    '/tmp/dumi-app/.dumi/tmp/dumi-utoopack-demo-assets.jsonl',
  ],
] as const)(
  'utoopack demo assets file for env %s and exportStatic %s',
  async (env, exportStaticEnabled, expected) => {
    registerTsResolveExtension();
    const { getUtoopackDemoAssetsFile } = await import('.');

    expect(
      getUtoopackDemoAssetsFile({
        env,
        paths: { absTmpPath: '/tmp/dumi-app/.dumi/tmp' },
        isPluginEnable: (key) => key === 'exportStatic' && exportStaticEnabled,
      }),
    ).toBe(expected);
  },
);
