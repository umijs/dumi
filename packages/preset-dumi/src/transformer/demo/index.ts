import fs from 'fs';
import path from 'path';
import slash from 'slash2';
import * as babel from '@babel/core';
import * as types from '@babel/types';
import traverse from '@babel/traverse';
import generator from '@babel/generator';
import {
  getModuleResolvePkg,
  getModuleResolvePath,
  getModuleResolveContent,
} from '../../utils/moduleResolver';
import ctx from '../../context';

interface IDemoTransformResult {
  content: string;
  dependencies: { [key: string]: string };
  files: { [key: string]: { path: string; content: string } };
}

export const DEMO_COMPONENT_NAME = 'DumiDemo';
// locale dependency extensions which will be collected
export const LOCAL_DEP_EXT = [
  '.jsx',
  '.tsx',
  '.js',
  '.ts',
  '.json',
  '.less',
  '.css',
  '.scss',
  '.sass',
  '.styl',
];

const fileWatchers: { [key: string]: fs.FSWatcher } = {};

/**
 * transform code block statments to preview
 */
export default (
  raw: string,
  { isTSX, fileAbsPath }: { isTSX?: boolean; fileAbsPath: string },
): IDemoTransformResult => {
  const code = babel.transformSync(raw, {
    presets: [
      require.resolve('@babel/preset-react'),
      require.resolve('@babel/preset-env'),
      ...(ctx.umi?.config?.extraBabelPresets || []),
    ],
    plugins: [
      require.resolve('@babel/plugin-proposal-class-properties'),
      [require.resolve('@babel/plugin-transform-modules-commonjs'), { strict: true }],
      ...(isTSX ? [[require.resolve('@babel/plugin-transform-typescript'), { isTSX: true }]] : []),
      ...(ctx.umi?.config?.extraBabelPlugins || []),
    ],
    ast: true,
    babelrc: false,
    configFile: false,
  });
  const body = code.ast.program.body as types.Statement[];
  const dependencies: IDemoTransformResult['dependencies'] = {};
  const files: IDemoTransformResult['files'] = {};
  let reactVar: string;
  let returnStatement: types.ReturnStatement;

  // traverse all expression
  traverse(code.ast, {
    VariableDeclaration(callPath) {
      const callPathNode = callPath.node;

      // save react import variables
      if (
        callPathNode.declarations[0] &&
        types.isIdentifier(callPathNode.declarations[0].id) &&
        types.isCallExpression(callPathNode.declarations[0].init) &&
        types.isCallExpression(callPathNode.declarations[0].init.arguments[0]) &&
        types.isIdentifier(callPathNode.declarations[0].init.arguments[0].callee) &&
        callPathNode.declarations[0].init.arguments[0].callee.name === 'require' &&
        types.isStringLiteral(callPathNode.declarations[0].init.arguments[0].arguments[0]) &&
        callPathNode.declarations[0].init.arguments[0].arguments[0].value === 'react'
      ) {
        reactVar = callPathNode.declarations[0].id.name;
      }
    },
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
        });
        const resolvePathParsed = path.parse(resolvePath);

        if (resolvePath.includes('node_modules')) {
          // save external deps
          const pkg = getModuleResolvePkg({
            basePath: fileAbsPath,
            sourcePath: requireStr,
          });

          dependencies[pkg.name] = pkg.version;
        } else if (LOCAL_DEP_EXT.includes(resolvePathParsed.ext)) {
          // save local deps
          files[slash(path.relative(fileAbsPath, resolvePath)).replace(/(\.\/|\..\/)/g, '')] = {
            path: requireStr,
            content: getModuleResolveContent({
              basePath: fileAbsPath,
              sourcePath: requireStr,
            }),
          };

          // watch deps change
          if (process.env.NODE_ENV === 'development') {
            if (fileWatchers[resolvePath]) {
              fileWatchers[resolvePath].close();
            }

            fileWatchers[resolvePath] = fs.watch(resolvePath, () => {
              // trigger parent file change to update frontmatter when dep file change
              fs.writeFileSync(fileAbsPath, fs.readFileSync(fileAbsPath));
            });
          }
        }
      }
    },
    AssignmentExpression(callPath) {
      const callPathNode = callPath.node;

      if (
        callPathNode.operator === '=' &&
        types.isMemberExpression(callPathNode.left) &&
        (callPathNode.left.property.value === 'default' || // exports["default"]
          callPathNode.left.property.name === 'default') && // exports.default
        types.isIdentifier(callPathNode.left.object) &&
        callPathNode.left.object.name === 'exports'
      ) {
        // remove original export expression
        if (types.isIdentifier(callPathNode.right) && callPathNode.right.name === '_default') {
          // save export function as return statement arg
          const reactIdentifier = reactVar
            ? types.memberExpression(
                types.identifier(reactVar),
                types.stringLiteral('default'),
                true,
              )
            : types.identifier('React');

          returnStatement = types.returnStatement(
            types.callExpression(
              types.memberExpression(reactIdentifier, types.identifier('createElement')),
              [callPathNode.right],
            ),
          );
          callPath.remove();
        }

        // remove uesless exports.default = void 0;
        if (types.isUnaryExpression(callPathNode.right)) {
          callPath.remove();
        }
      }
    },
  });

  // push return statement to program body
  if (returnStatement) {
    body.push(returnStatement);
  }

  // if user forgot to import react, redeclare it in local scope for throw error
  if (!reactVar) {
    body.unshift(
      types.variableDeclaration('var', [types.variableDeclarator(types.identifier('React'))]),
    );
  }

  // create demo function
  const demoFunction = types.functionDeclaration(
    types.identifier(DEMO_COMPONENT_NAME),
    [],
    types.blockStatement(body),
  );

  return {
    content: generator(types.program([demoFunction]), {}, raw).code,
    dependencies,
    files,
  };
};
