import visit from 'unist-util-visit';
import toString from 'hast-util-to-string';
import has from 'hast-util-has-property';
import is from 'hast-util-is-element';

const headings = ['h2', 'h3'];

export default () => (ast, vFile) => {
  // extract if user did not set slugs to false
  if (vFile.data.slugs !== false) {
    // initial slugs meta
    vFile.data.slugs = [];

    visit(ast, 'element', node => {
      if (is(node, headings) && has(node, 'id')) {
        vFile.data.slugs.push({
          depth: parseInt(node.tagName[1], 10) - 1,
          value: toString(node),
          heading: (node.properties as any)?.id,
        });
      }
    });
  } else {
    delete vFile.data.slugs;
  }
};
