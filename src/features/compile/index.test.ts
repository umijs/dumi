import fs from 'fs';
import Module from 'module';
import os from 'os';
import path from 'path';
import { vi } from 'vitest';

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

test('registered tech stacks are replaced between generate cycles', async () => {
  registerTsResolveExtension();
  const compileFeature = await import('.');
  const generateHooks: any[] = [];
  const applyPlugins = vi.fn();
  const api: any = new Proxy(
    {
      ApplyPluginsType: { add: 'add' },
      applyPlugins,
      config: {},
      onGenerateFiles: vi.fn((hook) => generateHooks.push(hook)),
      userConfig: {},
    },
    {
      get(target, property) {
        if (property in target) return target[property as keyof typeof target];

        return vi.fn();
      },
    },
  );
  const first = { name: 'first' } as any;
  const second = { name: 'second' } as any;
  const reference = compileFeature.techStacks;

  applyPlugins.mockResolvedValueOnce([first]).mockResolvedValueOnce([second]);
  compileFeature.default(api);

  const registerTechStacks = generateHooks.find(
    (hook) => hook.stage === -Infinity,
  ).fn;

  try {
    await registerTechStacks();
    await registerTechStacks();

    expect(compileFeature.techStacks).toBe(reference);
    expect(compileFeature.techStacks).toEqual([second]);
  } finally {
    compileFeature.techStacks.length = 0;
  }
});

test('utoopack config and first generate cycle reuse one tech stack registration', async () => {
  registerTsResolveExtension();
  const compileFeature = await import('.');
  const generateHooks: any[] = [];
  const configHooks: any[] = [];
  const stack = {
    name: 'scoped',
    runtimeOpts: { deferDemoSidecar: true },
  } as any;
  const applyPlugins = vi.fn().mockResolvedValue([stack]);
  const api: any = new Proxy(
    {
      ApplyPluginsType: { add: 'add' },
      applyPlugins,
      config: { utoopack: {} },
      cwd: '/tmp/dumi-app',
      env: 'development',
      modifyConfig: vi.fn((hook) => configHooks.push(hook)),
      onGenerateFiles: vi.fn((hook) => generateHooks.push(hook)),
      paths: { absTmpPath: '/tmp/dumi-app/.dumi/tmp' },
      userConfig: {},
    },
    {
      get(target, property) {
        if (property in target) return target[property as keyof typeof target];

        return vi.fn();
      },
    },
  );

  compileFeature.default(api);
  const utoopackConfigHook = configHooks.find(
    (hook) => hook.before === 'utoopack',
  ).fn;
  const registerTechStacks = generateHooks.find(
    (hook) => hook.stage === -Infinity,
  ).fn;

  try {
    const config = await utoopackConfigHook({
      utoopack: { turbopackMemoryEviction: true },
    });
    await registerTechStacks();

    expect(applyPlugins).toHaveBeenCalledOnce();
    expect(compileFeature.techStacks).toEqual([stack]);
    expect(config.utoopack).toMatchObject({
      turbopackBackgroundPersistence: false,
      turbopackMemoryEviction: true,
    });
  } finally {
    compileFeature.techStacks.length = 0;
  }
});

test('utoopack session cache cleanup uses the configured cache directory', async () => {
  registerTsResolveExtension();
  const compileFeature = await import('.');
  const { getCache, resolveDumiCacheDir } = await import('@/utils');
  const { MARKDOWN_LOADER_CACHE_EPOCH, getUtoopackMdCacheNamespace } =
    await import('./utoopackLoaders');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'dumi-cache-cleanup-'));
  const cwd = path.join(dir, 'app');
  const cacheDirectoryPath = '../shared-cache';
  const registeredHooks: any[] = [];
  const api: any = new Proxy(
    {
      config: { cacheDirectoryPath },
      cwd,
      register: vi.fn((hook) => registeredHooks.push(hook)),
      userConfig: {},
    },
    {
      get(target, property) {
        if (property in target) return target[property as keyof typeof target];

        return vi.fn();
      },
    },
  );
  const namespace = getUtoopackMdCacheNamespace(MARKDOWN_LOADER_CACHE_EPOCH);
  const cacheDirectory = resolveDumiCacheDir(cwd, cacheDirectoryPath);
  const sessionCache = getCache(namespace, cacheDirectory) as ReturnType<
    typeof getCache
  > & { basePath: string };
  const defaultSessionPath = path.join(resolveDumiCacheDir(cwd), namespace);

  try {
    compileFeature.default(api);
    sessionCache.setSync('sentinel', true);
    fs.mkdirSync(defaultSessionPath, { recursive: true });
    fs.writeFileSync(path.join(defaultSessionPath, 'sentinel'), 'keep');

    expect(sessionCache.basePath).toBe(path.join(cacheDirectory, namespace));
    expect(fs.existsSync(sessionCache.basePath)).toBe(true);

    registeredHooks.find((hook) => hook.key === 'onExit').fn();

    expect(fs.existsSync(sessionCache.basePath)).toBe(false);
    expect(fs.existsSync(defaultSessionPath)).toBe(true);
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});
