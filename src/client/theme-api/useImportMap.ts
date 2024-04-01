import { useMemo, useState } from 'react';
import { ExtendedImportMap } from './sandbox';
import { IDemoData } from './types';
import { SUPPORTED_MODULE } from './utils';

export const useImportMap = (demo: IDemoData) => {
  const { context, asset } = demo;

  const [internalImportMap, setImportMap] = useState({
    builtins: context || {},
  });

  const importMap = useMemo(() => {
    if (SUPPORTED_MODULE === 'cjs') return null;
    return Object.assign(
      {
        imports: {},
        scopes: {},
      },
      internalImportMap,
      {
        builtins: Object.keys(internalImportMap.builtins).reduce(
          (builtins, dep) => {
            builtins[dep] = asset.dependencies[dep]?.value;
            return builtins;
          },
          {} as NonNullable<ExtendedImportMap['builtins']>,
        ),
      },
    ) as ExtendedImportMap<string>;
  }, [internalImportMap]);

  async function updateImportMap(modifiedImportMap: ExtendedImportMap) {
    const map: ExtendedImportMap = {};
    if (modifiedImportMap.imports) {
      map.imports = modifiedImportMap.imports;
    }
    if (modifiedImportMap.scopes) {
      map.scopes = modifiedImportMap.scopes;
    }
    setImportMap(() => ({
      ...internalImportMap,
      ...map,
    }));
  }
  return {
    /**
     * Provided to sandbox
     */
    internalImportMap,
    /**
     * provided to editor
     */
    importMap,
    updateImportMap,
  };
};
