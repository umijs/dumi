import Module from 'module';
import path from 'path';
import { vi } from 'vitest';

const absTmpPath = path.join(path.sep, 'tmp', 'dumi-app', '.dumi', 'tmp');
const demoAssetsFile = path.join(absTmpPath, 'dumi-utoopack-demo-assets.jsonl');

function registerTsResolveExtension() {
  const extensions = (Module as any)._extensions as NodeJS.RequireExtensions;

  extensions['.ts'] ??= extensions['.js'];
}

test('replaceTechStacks keeps a stable array without accumulating entries', async () => {
  registerTsResolveExtension();
  const { replaceTechStacks, techStacks } = await import('.');
  const originalReference = techStacks;
  const first = { name: 'first' } as any;
  const second = { name: 'second' } as any;

  replaceTechStacks([first]);
  replaceTechStacks([second]);

  expect(techStacks).toBe(originalReference);
  expect(techStacks).toEqual([second]);

  replaceTechStacks([]);
});

test('utoopack cache sessions stay stable for file regeneration and change between services', async () => {
  registerTsResolveExtension();
  const { default: compile } = await import('.');
  function createService() {
    const api = {
      env: 'development',
      config: { utoopack: {} },
      paths: { absTmpPath },
      appData: { routes: {} },
      service: {},
      describe: vi.fn(),
      register: vi.fn(),
      modifyConfig: vi.fn(),
      onGenerateFiles: vi.fn(),
      addRuntimePlugin: vi.fn(),
      chainWebpack: vi.fn(),
      writeTmpFile: vi.fn(),
    };
    compile(api as any);
    const generateContext = api.onGenerateFiles.mock.calls[1][0].fn;

    return () => {
      generateContext();
      const { content } = api.writeTmpFile.mock.calls.at(-1)![0];
      return JSON.parse(
        content.match(/exports\.cacheSession = ("[^"]+");/)![1],
      );
    };
  }

  const firstService = createService();
  const firstSession = firstService();

  expect(firstSession).toMatch(/^[0-9a-f]{32}$/);
  expect(firstService()).toBe(firstSession);
  expect(createService()()).not.toBe(firstSession);
});

test.each([
  ['production', { utoopack: {} }, undefined],
  ['test', { utoopack: {} }, undefined],
  ['development', {}, undefined],
  ['production', {}, undefined],
  ['development', { mako: {} }, undefined],
  ['development', { utoopack: {} }, 'none'],
] as const)(
  'worker cache sessions do not affect env %s with config %j and cache %s',
  async (env, config, cache) => {
    registerTsResolveExtension();
    const { default: compile } = await import('.');
    const api = {
      env,
      config,
      paths: { absTmpPath },
      appData: { routes: {} },
      service: {},
      describe: vi.fn(),
      register: vi.fn(),
      modifyConfig: vi.fn(),
      onGenerateFiles: vi.fn(),
      addRuntimePlugin: vi.fn(),
      chainWebpack: vi.fn(),
      writeTmpFile: vi.fn(),
      isPluginEnable: vi.fn(() => false),
    };
    if (cache) vi.stubEnv('DUMI_CACHE', cache);
    try {
      compile(api as any);
      api.onGenerateFiles.mock.calls[1][0].fn();

      expect(api.writeTmpFile).toHaveBeenCalledTimes(
        'utoopack' in config ? 1 : 0,
      );
      expect(
        api.writeTmpFile.mock.calls.map(([file]) => file.content).join(''),
      ).not.toContain('cacheSession');
    } finally {
      if (cache) vi.unstubAllEnvs();
    }
  },
);

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
