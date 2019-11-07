import { Node } from 'unist';
import visit from 'unist-util-visit';

function hasSubClassName(className: string[], subCls: string) {
  return (className || []).find(cls => cls.indexOf(subCls) > -1);
}

const visitor = (node, i, parent) => {
  // escape { & } for JSX
  node.value = node.value.replace(/([{}])/g, '{\'$1\'}');

  // convert \n to <br> in code block for JSX
  if (
    parent
    && parent.tagName === 'code'
    && hasSubClassName(parent.properties.className, 'language-')
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
    parent.children.splice(i, 1, ...replace);
  }
}

export default () => (tree: Node) => {
  visit(tree, 'text', visitor);
}
