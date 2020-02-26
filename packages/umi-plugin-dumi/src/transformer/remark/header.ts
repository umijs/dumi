import visit from 'unist-util-visit';
import toString from 'hast-util-to-string';
import has from 'hast-util-has-property';
import is from 'hast-util-is-element';

const headings = ['h1', 'h2', 'h3', 'h4', 'h5'];

export default () => (ast, vFile) => {
  // initial slugs meta
  vFile.data.slugs = [];

  visit(ast, 'element', node => {
    if (is(node, headings) && has(node, 'id')) {
      const title = toString(node);

      vFile.data.slugs.push({
        depth: parseInt(node.tagName[1], 10),
        value: title,
        heading: (node.properties as any)?.id,
      });
    }
  });
};
