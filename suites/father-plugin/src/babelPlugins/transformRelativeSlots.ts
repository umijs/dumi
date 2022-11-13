import path from 'path';

function replacePath(nodePath: any, state: any) {
  if (
    nodePath.node.source &&
    // only process relative path
    nodePath.node.source.value.startsWith('.')
  ) {
    const finalPath = path
      .join(path.dirname(state.filename), nodePath.node.source.value)
      .replace(/\\/g, '/');

    // replace if final path is a slot component
    if (/\/slots\/[A-Z\d][^/]*(\/index)?$/.test(finalPath)) {
      nodePath.node.source.value = finalPath.replace(
        /.+(\/slots\/.+?)$/,
        'dumi/theme$1',
      );
    }
  }
}

/**
 * babel plugin for transform relative slot imports to `dumi/theme/slots`
 * to make sure theme slots can be override by user's local theme
 */
export default function transformRelativeSlots() {
  return {
    visitor: {
      ImportDeclaration: replacePath,
      ExportAllDeclaration: replacePath,
      ExportNamedDeclaration: replacePath,
      CallExpression(nodePath: any, state: any) {
        if (
          nodePath.node.callee?.name === 'require' ||
          nodePath.node.callee?.type === 'Import'
        ) {
          replacePath({ node: { source: nodePath.node.arguments[0] } }, state);
        }
      },
    },
  };
}
