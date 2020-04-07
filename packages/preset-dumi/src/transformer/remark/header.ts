import visit from 'unist-util-visit';
import toString from 'hast-util-to-string';
import has from 'hast-util-has-property';
import is from 'hast-util-is-element';

const headings = ['h1', 'h2', 'h3', 'h4', 'h5'];

function excludeComponentFromChildren(children) {
  const rawStack = [];

  return children.filter(item => {
    if (item.type === 'raw') {
      // ignore self-closing raw node, like <img />
      if (/^<[A-Z][^\/]+>$/.test(item.value)) {
        rawStack.push(item.value);
      } else if (/^<\/[A-Z]/.test(item.value)) {
        rawStack.pop();
      }

      return false;
    }

    // discard children if it was wrapped by built-in Component
    return !rawStack.length;
  });
}

export default () => (ast, vFile) => {
  // initial slugs meta
  vFile.data.slugs = [];

  visit(ast, 'element', node => {
    if (is(node, headings) && has(node, 'id')) {
      const title = toString({
        children: excludeComponentFromChildren(node.children),
        value: node.value,
      });

      vFile.data.slugs.push({
        depth: parseInt(node.tagName[1], 10),
        value: title,
        heading: (node.properties as any)?.id,
      });

      if (!vFile.data.title) {
        vFile.data.title = title;
      }
    }
  });
};
