import { execFile } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import { expect, test } from 'vitest';

const execFileAsync = promisify(execFile);

interface Scenario {
  checks?: number;
  existingParser?: boolean;
  userConfig?: {
    resolve?: { entryFile: string };
    vue?: {
      directory?: string;
      tsconfigPath?: string;
      checkerOptions?: Record<string, boolean>;
    };
  };
}

// Load the real plugin in a fresh process: Vitest's module cache and mock
// hoisting must not hide a runtime import of the worker-owning atomParser.
async function runPlugin(scenario: Scenario = {}) {
  const code = `
    const fs = require('fs');
    const Module = require('module');
    const esbuild = require(${JSON.stringify(
      require.resolve('@umijs/bundler-utils/compiled/esbuild'),
    )});
    const commonPath = fs.realpathSync(${JSON.stringify(
      path.join(__dirname, 'common.ts'),
    )});
    Module._extensions['.ts'] = (mod, filename) => {
      const { code } = esbuild.transformSync(fs.readFileSync(filename, 'utf8'), {
        loader: 'ts', format: 'cjs', target: 'node18',
      });
      mod._compile(code, filename);
    };
    const scenario = ${JSON.stringify(scenario)};
    const options = [];
    let atomParserLoads = 0;
    const load = Module._load;
    Module._load = function(request, parent, ...args) {
      if (parent?.filename === commonPath && request === './atomParser') {
        atomParserLoads++;
        return { VueApiParser: value => {
          options.push(value);
          return { name: 'vue', options: value };
        } };
      }
      return load.call(this, request, parent, ...args);
    };
    const plugin = require(commonPath).default;
    const loadsAfterImport = atomParserLoads;
    const existingParser = scenario.existingParser ? { name: 'existing' } : undefined;
    const api = {
      cwd: '/project',
      pkg: { repository: { directory: 'packages/components' } },
      userConfig: scenario.userConfig ?? { resolve: { entryFile: 'src/index.ts' } },
      service: { atomParser: existingParser },
      describe() {},
      modifyBabelPresetOpts() {},
      onCheckPkgJSON(hook) { this.check = hook; },
    };
    plugin(api);
    const loadsAfterRegistration = atomParserLoads;
    const parsers = [];
    for (let i = 0; i < (scenario.checks ?? 0); i++) {
      api.check.fn();
      parsers.push(api.service.atomParser);
    }
    console.log(JSON.stringify({
      loadsAfterImport,
      loadsAfterRegistration,
      atomParserLoads,
      options,
      runsBeforeCore: api.check.stage === -Infinity,
      reusesParser: parsers.length > 1 && parsers.every(parser => parser === parsers[0]),
      preservesExistingParser: api.service.atomParser === existingParser,
    }));
  `;
  const { stdout } = await execFileAsync(process.execPath, ['--eval', code], {
    timeout: 10000,
  });
  return JSON.parse(stdout);
}

test('setup can load and register the Vue preset without loading its atom parser', async () => {
  const result = await runPlugin();

  expect(result.loadsAfterImport).toBe(0);
  expect(result.loadsAfterRegistration).toBe(0);
  expect(result.options).toEqual([]);
});

test('dev/build creates the Vue parser before core with the configured options', async () => {
  const result = await runPlugin({
    checks: 1,
    userConfig: {
      resolve: { entryFile: 'lib/index.ts' },
      vue: {
        directory: 'packages/vue',
        tsconfigPath: 'tsconfig.build.json',
        checkerOptions: { forceUseTs: true },
      },
    },
  });

  expect(result.runsBeforeCore).toBe(true);
  expect(result.loadsAfterRegistration).toBe(0);
  expect(result.atomParserLoads).toBe(1);
  expect(result.options).toEqual([
    {
      entryFile: 'lib/index.ts',
      resolveDir: '/project',
      directory: 'packages/vue',
      tsconfigPath: 'tsconfig.build.json',
      checkerOptions: { forceUseTs: true },
    },
  ]);
});

test('package changes reuse the Vue parser and its existing watch subscriptions', async () => {
  const result = await runPlugin({ checks: 2 });

  expect(result.reusesParser).toBe(true);
  expect(result.atomParserLoads).toBe(1);
  expect(result.options).toEqual([
    {
      entryFile: 'src/index.ts',
      resolveDir: '/project',
      directory: 'packages/components',
    },
  ]);
});

test('package checks preserve a parser supplied by another plugin', async () => {
  const result = await runPlugin({ checks: 2, existingParser: true });

  expect(result.preservesExistingParser).toBe(true);
  expect(result.atomParserLoads).toBe(0);
  expect(result.options).toEqual([]);
});

test('package checks without an entry file do not load the Vue atom parser', async () => {
  const result = await runPlugin({ checks: 1, userConfig: {} });

  expect(result.atomParserLoads).toBe(0);
  expect(result.options).toEqual([]);
});
