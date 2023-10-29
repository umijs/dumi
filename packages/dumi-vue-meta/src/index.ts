import {
  createParsedCommandLine,
  createParsedCommandLineByJson,
} from '@vue/language-core';
import fs from 'fs';
import process from 'process';
import * as path from 'typesafe-path/posix';
import { Project, TypeCheckService } from './checker';
import type { MetaCheckerOptions } from './types';
import { getPosixPath } from './utils';

export * from './checker';
export * from './dumiTransfomer';
export { vueTypesSchemaResolver } from './schemaResolver/custom';
export * from './types';
export { createRef } from './utils';

export type ComponentMetaChecker = typeof TypeCheckService;

export interface CheckerProjectJsonOptions {
  root: string;
  json: any;
  checkerOptions?: MetaCheckerOptions;
  ts?: typeof import('typescript/lib/tsserverlibrary');
}

/**
 * Create component metadata checker through json configuration
 */
export function createProjectByJson(options: CheckerProjectJsonOptions) {
  const {
    root,
    json,
    checkerOptions = {},
    ts = require('typescript'),
  } = options;
  const rootPath = getPosixPath(root);
  return new Project(
    () => createParsedCommandLineByJson(ts, ts.sys, root, json),
    ts,
    checkerOptions,
    rootPath,
    path.join(rootPath, 'jsconfig.json.global.vue' as path.PosixPath),
  );
}

export interface CheckerProjectOptions {
  tsconfigPath: string;
  checkerOptions?: MetaCheckerOptions;
  ts?: typeof import('typescript/lib/tsserverlibrary');
}

const defaultTsConfig = {
  compilerOptions: {
    baseUrl: './',
    strict: true,
    declaration: true,
    skipLibCheck: true,
    esModuleInterop: true,
    resolveJsonModule: true,
    jsx: 'preserve',
    jsxImportSource: 'vue',
    strictNullChecks: false,
    paths: {
      '@/*': ['src/*'],
    },
  },
  include: ['src/**/*', 'docs/**/*'],
};

/**
 * Create a meta checker for Vue project
 * @param optionsOrRootPath You can pass in the project root directory or specific configuration.
 * @example
 * ```ts
 * import { createProject } from 'dumi-vue-meta';
 * // Manually pass in the tsconfig.json path
 * createProject({
 *   tsconfigPath: '<project-root>/tsconfig.json',
 *   checkerOptions: {},
 * });
 * ```
 * If no parameters are passed in, tsconfig.json in the current workspace will be read.
 * ```ts
 * import { createProject } from 'dumi-vue-meta';
 * createProject();
 * ```
 */
export function createProject(
  options?: CheckerProjectOptions | string,
): Project {
  if (typeof options === 'string' || !options) {
    const rootPath = options ?? process.cwd();
    try {
      const tryPath = path.join(
        getPosixPath(rootPath),
        getPosixPath('tsconfig.json'),
      );
      fs.accessSync(tryPath, fs.constants.R_OK);
      return createProject({ tsconfigPath: tryPath });
    } catch (error) {} // ignore error
    return createProjectByJson({
      root: rootPath,
      json: defaultTsConfig,
    });
  }
  const {
    tsconfigPath,
    checkerOptions = {},
    ts = require('typescript'),
  } = options;
  const tsconfig = getPosixPath(tsconfigPath);
  return new Project(
    () => createParsedCommandLine(ts, ts.sys, tsconfigPath),
    ts,
    checkerOptions,
    path.dirname(tsconfig),
    tsconfig + '.global.vue',
  );
}
