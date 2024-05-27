import {
  createLanguageServiceHost,
  decorateLanguageService,
} from '@volar/typescript';
import type {
  TypeScriptLanguageHost,
  VueCompilerOptions,
} from '@vue/language-core';
import { createLanguageContext, createVueLanguage } from '@vue/language-core';
import type ts from 'typescript/lib/tsserverlibrary';
import type { MetaCheckerOptions } from '../types';
import {
  getMetaFileName,
  getMetaScriptContent,
  isMetaFileName,
} from './helpers';

export function createVueLanguageService(
  ts: typeof import('typescript/lib/tsserverlibrary'),
  _host: TypeScriptLanguageHost,
  checkerOptions: MetaCheckerOptions,
  vueCompilerOptions: VueCompilerOptions,
  globalComponentName: string,
) {
  const globalComponentSnapshot = ts.ScriptSnapshot.fromString(
    '<script setup lang="ts"></script>',
  );
  const metaSnapshots: Record<string, ts.IScriptSnapshot> = {};
  const host = new Proxy<Partial<TypeScriptLanguageHost>>(
    {
      getScriptFileNames: () => {
        const names = _host.getScriptFileNames();
        return [
          ...names,
          ...names.map(getMetaFileName),
          globalComponentName,
          getMetaFileName(globalComponentName),
        ];
      },
      getScriptSnapshot: (fileName) => {
        if (isMetaFileName(fileName)) {
          if (!metaSnapshots[fileName]) {
            metaSnapshots[fileName] = ts.ScriptSnapshot.fromString(
              getMetaScriptContent(fileName, vueCompilerOptions.target),
            );
          }
          return metaSnapshots[fileName];
        } else if (fileName === globalComponentName) {
          return globalComponentSnapshot;
        } else {
          return _host.getScriptSnapshot(fileName);
        }
      },
    },
    {
      get(target, prop) {
        if (prop in target) {
          return target[prop as keyof typeof target];
        }
        return _host[prop as keyof typeof _host];
      },
    },
  ) as TypeScriptLanguageHost;
  const vueLanguages = ts
    ? [
        createVueLanguage(
          ts,
          host.getCompilationSettings() as ts.CompilerOptions,
          vueCompilerOptions,
        ),
      ]
    : [];
  const core = createLanguageContext(host, vueLanguages);
  // @ts-ignore
  const tsLsHost = createLanguageServiceHost(core, ts, ts.sys, undefined);
  // @ts-ignore
  const tsLs = ts.createLanguageService(tsLsHost);
  // @ts-ignore
  decorateLanguageService(core.virtualFiles, tsLs, false);

  if (checkerOptions.forceUseTs) {
    const getScriptKind = tsLsHost.getScriptKind;
    tsLsHost.getScriptKind = (fileName) => {
      if (fileName.endsWith('.vue.js')) {
        return ts.ScriptKind.TS;
      }
      if (fileName.endsWith('.vue.jsx')) {
        return ts.ScriptKind.TSX;
      }
      return getScriptKind!(fileName);
    };
  }

  return {
    core,
    tsLs,
    host,
  };
}

export type VueLanguageService = ReturnType<typeof createVueLanguageService>;
