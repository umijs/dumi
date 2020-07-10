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
import { saveFileOnDepChange } from '../../utils/watcher';
import { getBabelOptions, IDemoOpts } from './options';

interface IDepAnalyzeResult {
  dependencies: { [key: string]: string };
  files: { [key: string]: { path: string; content: string } };
}

export const LOCAL_DEP_EXT = ['.jsx', '.tsx', '.js', '.ts'];

export const LOCAL_MODULE_EXT = [...LOCAL_DEP_EXT, '.json'];

// local dependency extensions which will be collected
export const PLAIN_TEXT_EXT = [...LOCAL_MODULE_EXT, '.less', '.css', '.scss', '.sass', '.styl'];

function analyzeDeps(
  raw: babel.BabelFileResult['ast'] | string,
  { isTSX, fileAbsPath, entryAbsPath }: IDemoOpts & { entryAbsPath?: string },
  totalFiles?: IDepAnalyzeResult['files'],
): IDepAnalyzeResult {
  // support to pass babel transform result directly
  const ast =
    typeof raw === 'string'
      ? babel.transformSync(raw, getBabelOptions({ isTSX, fileAbsPath, transformRuntime: false }))
          .ast
      : raw;
  const files = totalFiles || {};
  const dependencies = {};

  // traverse all expression
  traverse(ast, {
    CallExpression(callPath) {
      const callPathNode = callPath.node;

      // tranverse all require statement
      if (
        types.isIdentifier(callPathNode.callee) &&
        callPathNode.callee.name === 'require' &&
        types.isStringLiteral(callPathNode.arguments[0]) &&
        callPathNode.arguments[0].value !== 'react'
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

          if (pkg.peerDependencies) {
            Object.assign(dependencies, pkg.peerDependencies);
          }

          dependencies[pkg.name] = pkg.version;
        } else if (
          // only analysis for valid local file type
          PLAIN_TEXT_EXT.includes(resolvePathParsed.ext) &&
          // do not collect entry file
          resolvePath !== entryAbsPath &&
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
              path: requireStr,
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
            saveFileOnDepChange(fileAbsPath, resolvePath);
          }
        }
      }
    },
  });

  return { files, dependencies };
}

export default analyzeDeps;
