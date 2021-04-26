import path from 'path';
import * as babel from '@babel/core';
import * as types from '@babel/types';
import traverse from '@babel/traverse';
import generator from '@babel/generator';
import { winPath } from '@umijs/utils';
import type { IDemoOpts } from './options';
import { getBabelOptions } from './options';
import { isDynamicEnable } from '../utils';

interface IDemoTransformResult {
  content: string;
}

export { default as getDepsForDemo } from './dependencies';
export { getCSSForDep } from './dependencies';

export const DEMO_COMPONENT_NAME = 'DumiDemo';

/**
 * transform code block statments to preview
 */
export default (raw: string, opts: IDemoOpts): IDemoTransformResult => {
  const code = babel.transformSync(raw, getBabelOptions(opts));
  const body = code.ast.program.body as types.Statement[];
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
    AssignmentExpression(callPath) {
      const callPathNode = callPath.node;

      if (
        callPathNode.operator === '=' &&
        types.isMemberExpression(callPathNode.left) &&
        ((types.isStringLiteral(callPathNode.left.property) && // exports["default"]
          callPathNode.left.property.value === 'default') ||
          (types.isIdentifier(callPathNode.left.property) && // exports.default
            callPathNode.left.property.name === 'default')) &&
        types.isIdentifier(callPathNode.left.object) &&
        callPathNode.left.object.name === 'exports'
      ) {
        // remove original export expression
        if (types.isIdentifier(callPathNode.right)) {
          // save export function as return statement arg
          if (isDynamicEnable()) {
            // for dynamic({ loader }), transform to return _default;
            returnStatement = types.returnStatement(callPathNode.right);
          } else {
            // for function component, transform to _react['default'].createElement(_default, null);
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
          }
          callPath.remove();
        }

        // remove uesless exports.default = void 0;
        if (types.isUnaryExpression(callPathNode.right)) {
          callPath.remove();
        }
      }
    },
    CallExpression(callPath) {
      const callPathNode = callPath.node;

      // transform all require
      if (
        types.isIdentifier(callPathNode.callee) &&
        callPathNode.callee.name === 'require' &&
        types.isStringLiteral(callPathNode.arguments[0])
      ) {
        const isRelativeModule = callPathNode.arguments[0].value.startsWith('.');
        // about header helpers: https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-runtime/src/index.js#L177
        const isHeaderHelpers = /@babel\/runtime\/helpers\/(interopRequireWildcard|interopRequireDefault)$/.test(
          callPathNode.arguments[0].value,
        );

        if (isRelativeModule) {
          // transform all require('./other.jsx') to require('/absolute/path/to/other.jsx')
          callPathNode.arguments[0].value = winPath(
            path.join(path.dirname(opts.fileAbsPath), callPathNode.arguments[0].value),
          );
        }

        if (isDynamicEnable() && !isHeaderHelpers) {
          // transform require('react') to await import ('react')
          callPath.replaceWith(
            types.awaitExpression(
              types.callExpression(types.import(), [
                types.stringLiteral(callPathNode.arguments[0].value),
              ]),
            ),
          );
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
  let demoFunction: types.FunctionExpression | types.CallExpression;

  if (isDynamicEnable()) {
    // wrap as dynamic({ loader: async function () {} })
    demoFunction = types.callExpression(types.identifier('dynamic'), [
      types.objectExpression([
        types.objectProperty(
          types.identifier('loader'),
          types.functionExpression(null, [], types.blockStatement(body), false, true),
        ),
      ]),
    ]);
  } else {
    // wrap as function DumiDemo() {}
    demoFunction = types.functionExpression(
      types.identifier(DEMO_COMPONENT_NAME),
      [],
      types.blockStatement(body),
    );
  }

  return {
    content: generator(demoFunction, {}, raw).code,
  };
};
