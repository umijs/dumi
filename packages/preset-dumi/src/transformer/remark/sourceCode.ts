import visit from 'unist-util-visit';
import toString from 'hast-util-to-string';

export default () => {
  return tree => {
    visit(tree, 'element', (node, i, parent) => {
      if (node.tagName === 'pre' && node.children?.[0]?.tagName === 'code') {
        const cls = node.children[0].properties.className || [];
        const lang = cls.join('').match(/language-(\w+)(?:$| )/)?.[1] || 'unknown';

        parent.children.splice(i, 1, {
          type: 'raw',
          position: node.position,
          value: `<SourceCode code={${JSON.stringify(
            toString(node.children[0]),
          )}} lang=${JSON.stringify(lang)} />`,
        });
      }
    });
  };
};
