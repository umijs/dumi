import type { PropertyMeta, PropertySchemaResolver } from '../../types';
import { getNodeOfSymbol } from '../../utils';

export const vueOptionSchemaResolver: PropertySchemaResolver<PropertyMeta> = (
  meta,
  { ts, targetNode, targetType },
) => {
  if (!targetNode || !targetType) return meta;

  const requiredSymbol = targetType.getProperty('required');
  const requiredNode = getNodeOfSymbol(requiredSymbol);
  if (requiredNode && ts.isPropertyAssignment(requiredNode)) {
    if (requiredNode.initializer.kind === ts.SyntaxKind.TrueKeyword) {
      meta.required = true;
    } else if (requiredNode.initializer.kind === ts.SyntaxKind.FalseKeyword) {
      meta.required = false;
    }
  }
  const defaultSymbol = targetType.getProperty('default');
  const defaultNode = getNodeOfSymbol(defaultSymbol);
  // If default is a function, it is too complicated. Users can set it by @default.
  if (defaultNode && ts.isPropertyAssignment(defaultNode)) {
    meta.default = defaultNode.initializer.getText();
  }
  return meta;
};
