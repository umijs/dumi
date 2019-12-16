import visit from 'unist-util-visit';
import has from 'hast-util-has-property';
import is from 'hast-util-is-element';

const headings = ['h2', 'h3']; // 先只取两级

const extractText = header =>
  header.children
    .map((x)=> {
      if (x.type === 'text') {
        return x.value;
      }
      return '';
    })
    .join('');

export default () => (ast, vFile) => {
  if (vFile.data.slugs !== false) {
    visit(ast, 'element', node => {
      if (is(node, headings) && has(node, 'id')) {
        if (!vFile.data.slugs) {
          vFile.data.slugs = [];
        }

        vFile.data.slugs.push({
          depth: parseInt(node.tagName[1], 10) - 1,
          value: extractText(node),
          heading: (node.properties as any)?.id,
        });
      }
    });
  }
};
