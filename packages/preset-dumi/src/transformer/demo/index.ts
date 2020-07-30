import * as babel from '@babel/core';
import * as types from '@babel/types';
import traverse from '@babel/traverse';
import generator from '@babel/generator';
import { getBabelOptions, IDemoOpts } from './options';

interface IDemoTransformResult {
  content: string;
  ast: babel.BabelFileResult['ast'];
}

export { default as getDepsForDemo } from './dependencies';
export { getCSSForDeps } from './dependencies';

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
        (callPathNode.left.property.value === 'default' || // exports["default"]
          callPathNode.left.property.name === 'default') && // exports.default
        types.isIdentifier(callPathNode.left.object) &&
        callPathNode.left.object.name === 'exports'
      ) {
        // remove original export expression
        if (types.isIdentifier(callPathNode.right)) {
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
    ast: code.ast,
    content: generator(types.program([demoFunction]), {}, raw).code,
  };
};
