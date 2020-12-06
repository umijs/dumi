import path from 'path';
import slash from 'slash';
import * as babel from '@babel/core';
import * as types from '@babel/types';
import traverse from '@babel/traverse';
import {
  getModuleResolvePkg,
  getModuleResolvePath,
  getModuleResolveContent,
} from '../../utils/moduleResolver';
import { IWatcherItem, listenFileOnceChange } from '../../utils/watcher';
import { getBabelOptions, IDemoOpts } from './options';

export interface IDepAnalyzeResult {
  dependencies: {
    [key: string]: {
      version: string;
      css?: string;
    };
  };
  files: { [key: string]: { import: string; content: string } };
}

export const LOCAL_DEP_EXT = ['.jsx', '.tsx', '.js', '.ts'];

export const LOCAL_MODULE_EXT = [...LOCAL_DEP_EXT, '.json'];

// local dependency extensions which will be collected
export const PLAIN_TEXT_EXT = [...LOCAL_MODULE_EXT, '.less', '.css', '.scss', '.sass', '.styl'];

function analyzeDeps(
  raw: babel.BabelFileResult['ast'] | string,
  {
    isTSX,
    fileAbsPath,
    entryAbsPath,
    depChangeListener,
  }: IDemoOpts & { entryAbsPath?: string; depChangeListener?: IWatcherItem['listeners'][0] },
  totalFiles?: IDepAnalyzeResult['files'],
): IDepAnalyzeResult {
  // support to pass babel transform result directly
  const ast =
    typeof raw === 'string'
      ? babel.transformSync(raw, getBabelOptions({ isTSX, fileAbsPath, transformRuntime: false }))
          .ast
      : raw;
  const files = totalFiles || {};
  const dependencies: IDepAnalyzeResult['dependencies'] = {};

  // traverse all expression
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
            sourcePath: requireStr,
            extensions: LOCAL_MODULE_EXT,
          });
          const css = getCSSForDep(pkg.name);

          Object.keys(pkg.peerDependencies || {})
            .filter(dep => !dependencies[dep])
            .forEach(dep => {
              const peerCss = getCSSForDep(dep);

              dependencies[dep] = { version: pkg.peerDependencies[dep] };

              // also collect css file for peerDependencies
              if (peerCss) {
                dependencies[dep].css = peerCss;
              }
            });

          dependencies[pkg.name] = { version: pkg.version };

          if (css) {
            dependencies[pkg.name].css = css;
          }
        } else if (
          // only analysis for valid local file type
          PLAIN_TEXT_EXT.includes(resolvePathParsed.ext) &&
          // do not collect entry file
          resolvePath !== slash(entryAbsPath || '') &&
          // to avoid collect alias module
          requireStr.startsWith('.')
        ) {
          // save local deps
          const fileName = slash(path.relative(fileAbsPath, resolvePath)).replace(
            /(\.\/|\..\/)/g,
            '',
          );

          // to avoid circular-reference
          if (fileName && !files[fileName]) {
            files[fileName] = {
              import: requireStr,
              content: getModuleResolveContent({
                basePath: fileAbsPath,
                sourcePath: requireStr,
                extensions: LOCAL_MODULE_EXT,
              }),
            };

            // continue to collect deps for dep
            if (LOCAL_DEP_EXT.includes(resolvePathParsed.ext)) {
              const result = analyzeDeps(
                files[fileName].content,
                {
                  isTSX: /\.tsx?/.test(resolvePathParsed.ext),
                  fileAbsPath: resolvePath,
                  entryAbsPath: entryAbsPath || fileAbsPath,
                },
                files,
              );

              Object.assign(files, result.files);
              Object.assign(dependencies, result.dependencies);
            }

            // trigger parent file change to update frontmatter when dep file change
            listenFileOnceChange(fileAbsPath, depChangeListener);
          }
        }
      }
    },
  });

  return { files, dependencies };
}

export function getCSSForDep(dep: string) {
  const pkgWithoutGroup = dep.match(/([^\/]+)$/)[1];
  const guessFiles = [
    // @group/pkg-suffic => pkg-suffix
    `${pkgWithoutGroup}`,
    // @group/pkg-suffix => pkgsuffix
    ...(pkgWithoutGroup.includes('-') ? [pkgWithoutGroup.replace(/-/g, '')] : []),
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
