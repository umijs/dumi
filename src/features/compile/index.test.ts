import Module from 'module';
import path from 'path';

const absTmpPath = path.join(path.sep, 'tmp', 'dumi-app', '.dumi', 'tmp');
const demoAssetsFile = path.join(absTmpPath, 'dumi-utoopack-demo-assets.jsonl');

function registerTsResolveExtension() {
  const extensions = (Module as any)._extensions as NodeJS.RequireExtensions;

  extensions['.ts'] ??= extensions['.js'];
}

test.each([
  ['development', true, undefined],
  ['test', true, undefined],
  ['production', false, undefined],
  ['production', true, demoAssetsFile],
] as const)(
  'utoopack demo assets file for env %s and exportStatic %s',
  async (env, exportStaticEnabled, expected) => {
    registerTsResolveExtension();
    const { getUtoopackDemoAssetsFile } = await import('.');

    expect(
      getUtoopackDemoAssetsFile({
        env,
        paths: { absTmpPath },
        isPluginEnable: (key) => key === 'exportStatic' && exportStaticEnabled,
      }),
    ).toBe(expected);
  },
);
