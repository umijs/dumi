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
 * @group project
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
  rootPath?: string;
  tsconfigPath?: string;
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

function getTsconfigPath(rootPath: string) {
  const tryPath = path.join(
    getPosixPath(rootPath),
    getPosixPath('tsconfig.json'),
  );
  return tryPath;
}

/**
 * Create a meta checker for Vue project with rootPath
 *
 * If no parameters are passed in, tsconfig.json in the current workspace will be read.
 * @group project
 * @example
 * ```ts
 * import { createProject } from '@dumijs/vue-meta';
 * createProject();
 * ```
 */
export function createProject(rootPath?: string): Project;
/**
 * Create a meta checker for Vue project by options
 * @group project
 * @example
 * ```ts
 * import { createProject } from '@dumijs/vue-meta';
 * // Manually pass in the tsconfig.json path
 * createProject({
 *   // If neither rootPath nor tsconfigPath is set, rootPath will be process.cwd()
 *   rootPath: '<project-root>',
 *   // If tsconfigPath is not set, tsconfig will be <rootPath>/tsconfig.json
 *   tsconfigPath: '<project-root>/tsconfig.json',
 *   checkerOptions: {},
 * });
 * ```
 */
export function createProject(options: CheckerProjectOptions): Project;
export function createProject(
  options?: CheckerProjectOptions | string,
): Project {
  if (typeof options === 'string' || !options) {
    const rootPath = options ?? process.cwd();
    try {
      const tsconfigPath = getTsconfigPath(rootPath);
      fs.accessSync(tsconfigPath, fs.constants.R_OK);
      return createProject({ rootPath, tsconfigPath });
    } catch (error) {} // ignore error
    return createProjectByJson({
      root: rootPath,
      json: defaultTsConfig,
    });
  }
  let {
    rootPath,
    tsconfigPath,
    checkerOptions = {},
    ts = require('typescript'),
  } = options;
  if (!rootPath && !tsconfigPath) {
    rootPath = process.cwd();
  }
  let tsconfig: path.PosixPath;
  let root: path.PosixPath;
  if (rootPath && !tsconfigPath) {
    root = getPosixPath(rootPath);
    tsconfig = getTsconfigPath(rootPath);
  } else if (tsconfigPath) {
    tsconfig = getPosixPath(tsconfigPath);
    root = rootPath ? getPosixPath(rootPath) : path.dirname(tsconfig);
  }
  fs.accessSync(tsconfig!, fs.constants.R_OK);
  return new Project(
    () => createParsedCommandLine(ts, ts.sys, tsconfig),
    ts,
    checkerOptions,
    root!,
    tsconfig! + '.global.vue',
  );
}
