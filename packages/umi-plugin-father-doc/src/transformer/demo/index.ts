import * as babel from '@babel/core';
import * as types from '@babel/types';
import traverse from '@babel/traverse';
import generator from '@babel/generator';

export const DEMO_COMPONENT_NAME = 'FatherDocDemo';

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
        : [])
    ],
    ast: true,
  });
  const body = code.ast.program.body as types.Statement[];
  let returnStatement;

  // traverse call expression
  traverse(code.ast, {
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
        returnStatement = types.returnStatement(
          types.callExpression(
            types.memberExpression(
              types.identifier('React'),
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

  // create demo function
  const demoFunction = types.functionDeclaration(
    types.identifier(DEMO_COMPONENT_NAME),
    [],
    types.blockStatement(body),
  );

  return generator(types.program([demoFunction]), {}, raw).code;
}
