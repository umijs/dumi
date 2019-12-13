import * as babel from '@babel/core';
import * as types from '@babel/types';
import traverse from '@babel/traverse';
import generator from '@babel/generator';

export const DEMO_COMPONENT_NAME = 'FatherDocDemo';
export let userExtraBabelPlugin = [];

export function setUserExtraBabelPlugin(plugins: any[]) {
  userExtraBabelPlugin = plugins;
}

/**
 * transform code block statments to preview
 */
export default (raw: string, isTSX?: boolean) => {
  const code = babel.transformSync(raw, {
    presets: [
      require.resolve('@babel/preset-react'),
      require.resolve('@babel/preset-env'),
    ],
    plugins: [
      require.resolve('@babel/plugin-proposal-class-properties'),
      ...(isTSX
        ? [[require.resolve('@babel/plugin-transform-typescript'), { isTSX: true }]]
        : []),
      ...userExtraBabelPlugin,
    ],
    ast: true,
    babelrc: false,
    configFile: false,
  });
  const body = code.ast.program.body as types.Statement[];
  let reactVar;
  let returnStatement;

  // traverse call expression
  traverse(code.ast, {
    VariableDeclaration(callPath) {
      const callPathNode = callPath.node;

      // save react import variables
      if (
        callPathNode.declarations[0]
        && types.isIdentifier(callPathNode.declarations[0].id)
        && types.isCallExpression(callPathNode.declarations[0].init)
        && types.isCallExpression(callPathNode.declarations[0].init.arguments[0])
        && types.isIdentifier(callPathNode.declarations[0].init.arguments[0].callee)
        && callPathNode.declarations[0].init.arguments[0].callee.name === 'require'
        && types.isStringLiteral(callPathNode.declarations[0].init.arguments[0].arguments[0])
        && callPathNode.declarations[0].init.arguments[0].arguments[0].value === 'react'
      ) {
        reactVar = callPathNode.declarations[0].id.name;
      }
    },
    AssignmentExpression(callPath) {
      const callPathNode = callPath.node;

      // remove original export expression
      if (
        callPathNode.operator === '='
        && types.isMemberExpression(callPathNode.left)
        && callPathNode.left.property.value === 'default'
        && types.isIdentifier(callPathNode.left.object)
        && callPathNode.left.object.name === 'exports'
        && types.isIdentifier(callPathNode.right)
        && callPathNode.right.name === '_default'
      ) {
        // save export function as return statement arg
        const reactIdentifier = (
          reactVar
            ? types.memberExpression(
              types.identifier(reactVar),
              types.stringLiteral('default'),
              true,
            )
            : types.identifier('React')
        )

        returnStatement = types.returnStatement(
          types.callExpression(
            types.memberExpression(
              reactIdentifier,
              types.identifier('createElement'),
            ),
            [callPathNode.right],
          )
        );
        callPath.remove();
      }
    }
  });

  // push return statement to program body
  if (returnStatement) {
    body.push(returnStatement);
  }

  // if user forgot to import react, redeclare it in local scope for throw error
  if (!reactVar) {
    body.unshift(types.variableDeclaration('var', [types.variableDeclarator(types.identifier('React'))]));
  }

  // create demo function
  const demoFunction = types.functionDeclaration(
    types.identifier(DEMO_COMPONENT_NAME),
    [],
    types.blockStatement(body),
  );

  return generator(types.program([demoFunction]), {}, raw).code;
}
