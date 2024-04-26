import type ts from 'typescript';
import type { PropertyMeta, PropertySchemaResolver } from '../../types';
import { createNodeVisitor } from '../../utils';

/**
 * A custom schema resolver for [vue-types](https://github.com/dwightjack/vue-types)
 * used to identify isRequired, def and other methods
 */
export const vueTypesSchemaResolver: PropertySchemaResolver<PropertyMeta> = (
  meta,
  { ts, typeChecker, targetNode, targetType },
) => {
  if (!targetNode || !targetType) return meta;

  const typeString = typeChecker.typeToString(targetType);
  const visit = createNodeVisitor(ts);
  if (typeString.match(/vuetype\w*def/i)) {
    // TODO: get flow node https://stackoverflow.com/questions/69461435/typescript-ast-how-to-get-the-asserted-type
    if (ts.isPropertyAssignment(targetNode)) {
      const requiredNode = visit(targetNode.initializer, (cnode) => {
        return (
          ts.isIdentifier(cnode) &&
          cnode.escapedText === 'isRequired' &&
          ts.isPropertyAccessExpression(cnode.parent)
        );
      });
      if (requiredNode) meta.required = true;
      const defNode = visit<ts.CallExpression>(
        targetNode.initializer,
        (cnode) => {
          return (
            ts.isCallExpression(cnode) &&
            ts.isPropertyAccessExpression(cnode.expression) &&
            cnode.expression.name.escapedText === 'def'
          );
        },
      );
      if (defNode) {
        const argNode = defNode.arguments[0];
        if (!ts.isFunctionExpression(argNode)) {
          meta.default = argNode.getText();
        }
      }
    }
  }
  return meta;
};
