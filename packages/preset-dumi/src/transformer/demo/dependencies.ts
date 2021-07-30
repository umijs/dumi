import path from 'path';
import slash from 'slash2';
import crypto from 'crypto';
import * as babel from '@babel/core';
import * as types from '@babel/types';
import traverse from '@babel/traverse';
import {
  getModuleResolvePkg,
  getModuleResolvePath,
  getModuleResolveContent,
} from '../../utils/moduleResolver';
import FileCache from '../../utils/cache';
import type { IDemoOpts } from './options';
import { getBabelOptions } from './options';

const cachers = {
  file: new FileCache(),
  content: new FileCache(),
};
const getContentHash = (content: string) => {
  const hash = crypto.createHash('sha256');
  hash.update(content);
  return hash.digest('hex');
};

interface IAnalyzeCache {
  dependencies: {
    resolvePath: string;
    name: string;
    version: string;
    css?: string;
    peerDeps: { name: string; version: string; css?: string }[];
  }[];
  files: {
    resolvePath: string;
    requireStr: string;
    filename: string;
  }[];
}

export interface IDepAnalyzeResult {
  dependencies: Record<string, {
    version: string;
    css?: string;
  }>;
  files: Record<string, { import: string; fileAbsPath: string }>;
}

export const LOCAL_DEP_EXT = ['.jsx', '.tsx', '.js', '.ts'];

export const LOCAL_MODULE_EXT = [...LOCAL_DEP_EXT, '.json'];

// local dependency extensions which will be collected
export const PLAIN_TEXT_EXT = [...LOCAL_MODULE_EXT, '.less', '.css', '.scss', '.sass', '.styl'];

function analyzeDeps(
  raw: string,
  {
    isTSX,
    fileAbsPath,
    entryAbsPath,
    files = {},
  }: IDemoOpts & {
    entryAbsPath?: string;
    files?: IDepAnalyzeResult['files'];
  },
): IDepAnalyzeResult {
  const cacheKey = fileAbsPath.endsWith('.md')
    ? `${fileAbsPath}-${getContentHash(raw)}`
    : fileAbsPath;
  const dependencies: IDepAnalyzeResult['dependencies'] = {};
  let cache: IAnalyzeCache = fileAbsPath && cachers.file.get(fileAbsPath);

  if (!cache) {
    cache = { dependencies: [], files: [] };

    // support to pass babel transform result directly
    const { ast } = babel.transformSync(
      raw,
      getBabelOptions({ isTSX, fileAbsPath, transformRuntime: false }),
    );

    // traverse all require call expression
    traverse(ast, {
      CallExpression(callPath) {
        const callPathNode = callPath.node;

        // tranverse all require statement
        if (
          types.isIdentifier(callPathNode.callee) &&
          callPathNode.callee.name === 'require' &&
          types.isStringLiteral(callPathNode.arguments[0])
        ) {
          const requireStr = callPathNode.arguments[0].value;
          const resolvePath = getModuleResolvePath({
            basePath: fileAbsPath,
            sourcePath: requireStr,
            extensions: LOCAL_MODULE_EXT,
          });
          const resolvePathParsed = path.parse(resolvePath);

          if (resolvePath.includes('node_modules')) {
            // save external deps
            const pkg = getModuleResolvePkg({
              basePath: fileAbsPath,
              sourcePath: resolvePath,
              extensions: LOCAL_MODULE_EXT,
            });
            const css = getCSSForDep(pkg.name);
            const peerDeps: IAnalyzeCache['dependencies'][0]['peerDeps'] = [];

            // process peer dependencies from dependency
            Object.keys(pkg.peerDependencies || {}).forEach(dep => {
              const peerCSS = getCSSForDep(dep);

              peerDeps.push({
                name: dep,
                version: pkg.peerDependencies[dep],
                // also collect css file for peerDependencies
                css: peerCSS,
              });
            });

            cache.dependencies.push({
              resolvePath,
              name: pkg.name,
              version: pkg.version,
              css,
              peerDeps,
            });
          } else if (
            // only analysis for valid local file type
            PLAIN_TEXT_EXT.includes(resolvePathParsed.ext) &&
            // do not collect entry file
            resolvePath !== slash(entryAbsPath || '') &&
            // to avoid collect alias module
            requireStr.startsWith('.')
          ) {
            // save local deps
            const filename = slash(path.relative(fileAbsPath, resolvePath)).replace(
              /(\.\/|\..\/)/g,
              '',
            );

            cache.files.push({
              resolvePath,
              requireStr,
              filename,
            });
          }
        }
      },
    });
  }

  // visit all dependencies
  cache.dependencies.forEach(item => {
    dependencies[item.name] = {
      version: item.version,
      ...(item.css ? { css: item.css } : {}),
    };
  });

  // visit all peer dependencies, to make sure collect 1-level dependency first
  cache.dependencies
    .reduce((result, item) => result.concat(item.peerDeps), [])
    .filter(item => !dependencies[item])
    .forEach(item => {
      dependencies[item.name] = {
        version: item.version,
        ...(item.css ? { css: item.css } : {}),
      };
    });

  // visit all local files
  cache.files
    .filter(item => {
      // to avoid circular-reference
      return !files[item.filename];
    })
    .forEach(item => {
      const ext = path.extname(item.resolvePath);

      files[item.filename] = cachers.content.get(item.resolvePath) || {
        import: item.requireStr,
        fileAbsPath: item.resolvePath,
      };

      // cache resolve content
      cachers.content.add(item.resolvePath, files[item.filename]);

      // continue to collect deps for dep
      if (LOCAL_DEP_EXT.includes(ext)) {
        const content = getModuleResolveContent({
          basePath: fileAbsPath,
          sourcePath: item.resolvePath,
          extensions: LOCAL_DEP_EXT,
        });
        const result = analyzeDeps(content, {
          isTSX: /\.tsx?/.test(ext),
          fileAbsPath: item.resolvePath,
          entryAbsPath: entryAbsPath || fileAbsPath,
          files,
        });

        Object.assign(files, result.files);
        Object.assign(dependencies, result.dependencies);
      }
    });

  // cache analyze result for single demo code
  if (fileAbsPath) {
    cachers.file.add(fileAbsPath, cache, cacheKey);
  }

  return { files, dependencies };
}

export function getCSSForDep(dep: string) {
  const pkgWithoutGroup = dep.match(/([^\/]+)$/)[1];
  const guessFiles = [
    // @group/pkg-suffic => pkg-suffix
    `${pkgWithoutGroup}`,
    // @group/pkg-suffix => pkgsuffix @ant-design/pro-card => card
    ...(pkgWithoutGroup.includes('-') ? [pkgWithoutGroup.replace(/-/g, ''), pkgWithoutGroup.split('-')[1]] : []),
    // guess normal css files
    'main',
    'index',
  ].reduce((files, name) => files.concat([`${name}.css`, `${name}.min.css`]), []);

  // detect guess css files
  for (let i = 0; i <= guessFiles.length; i += 1) {
    const file = guessFiles[i];

    try {
      // try to resolve CSS file
      const guessFilePath = `${dep}/dist/${file}`;

      getModuleResolvePath({
        basePath: process.cwd(),
        sourcePath: guessFilePath,
        silent: true,
      });

      return guessFilePath;
    } catch (err) {
      /* nothing */
    }
  }
}

export default analyzeDeps;
