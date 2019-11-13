import { Node } from 'unist';
import visit from 'unist-util-visit-parents';

function hasSubClassName(className: string[], subCls: string) {
  return (className || []).find(cls => cls.indexOf(subCls) > -1);
}

const visitor = (node, ancestors) => {
  const parentNode = ancestors[ancestors.length - 1];
  const closestCodeAncestor = ancestors.slice().reverse().find(ancestor => ancestor.tagName === 'code');

  // escape { & } for JSX
  node.value = node.value.replace(/([{}])/g, '{\'$1\'}');

  // convert \n to <br> in code block for JSX, for render indents & newlines
  if (
    closestCodeAncestor
    && hasSubClassName(closestCodeAncestor.properties.className, 'language-')
    && node.type === 'text'
  ) {
    const replace = node.value.split('\n').reduce((result, str, isNotFirst) => {
      if (isNotFirst) {
        result.push({ type: 'raw', value: '<br />' });
      }

      if (str) {
        result.push({ type: 'text', value: str });
      }

      return result;
    }, []);

    // replace original children
    parentNode.children.splice(parentNode.children.indexOf(node), 1, ...replace);
  }
}

export default () => (tree: Node) => {
  visit(tree, 'text', visitor);
}
