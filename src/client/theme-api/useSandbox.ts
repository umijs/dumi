import { useEffect, useRef } from 'react';
import { Sandbox, type ExtendedImportMap } from './sandbox';
import type { ModuleType } from './types';

type CommonJSContext = {
  module: any;
  exports: {
    default?: any;
  };
  require: any;
};

function evalCommonJS(
  cjs: string,
  { module, exports, require }: CommonJSContext,
) {
  new Function('module', 'exports', 'require', cjs)(module, exports, require);
}

function createSandbox(importMap: ExtendedImportMap, modules: ModuleType) {
  if (modules === 'esm') return Sandbox.create({ importMap });
  const require = (v: string) => {
    if (v in importMap.builtins!) return importMap.builtins![v];
    throw new Error(`Cannot find module: ${v}`);
  };
  return Promise.resolve({
    destory() {},
    exec(cjs: string) {
      const exports = {};
      evalCommonJS(cjs, {
        exports,
        module: { exports },
        require,
      });
      return exports;
    },
  } as Sandbox);
}

export function useSandbox(
  importMap: ExtendedImportMap,
  modules: ModuleType = 'esm',
) {
  const sandbox = useRef<Promise<Sandbox>>();
  const lastImportMap = useRef(importMap);
  function destorySandbox() {
    sandbox.current?.then((s) => s.destory());
  }
  if (lastImportMap.current !== importMap) {
    lastImportMap.current = importMap;
    sandbox.current = sandbox.current
      ?.then((s) => s.destory())
      .then(() => createSandbox(importMap, modules));
  }

  useEffect(() => () => destorySandbox(), []);

  return {
    init() {
      if (sandbox.current) return;
      sandbox.current = createSandbox(importMap, modules);
    },
    async exec(esm: string) {
      if (!sandbox.current) {
        throw new Error('Please execute init first');
      }
      const box = await sandbox.current;
      return box.exec(esm);
    },
  };
}
