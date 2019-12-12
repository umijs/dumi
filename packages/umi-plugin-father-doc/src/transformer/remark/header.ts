import visit from 'unist-util-visit';
import has from 'hast-util-has-property';
import is from 'hast-util-is-element';

const headings = ['h1', 'h2']; // 先只取两级

const extractText = header => {
  return header.children
    .map(function (x) {
      if (x.type === "text") {
        return x.value;
      } else {
        return "";
      }
    })
    .join("");
};

export default () => (ast, vFile) => {
  visit(ast, 'element', (node) => {
    if (is(node, headings) && has(node, 'id')) {
      if (!vFile.data.routeLayout) {
        vFile.data.routeLayout = []
      }
      vFile.data.routeLayout.push({
        depth: parseInt(node.tagName[1], 10),
        value: extractText(node),
        heading: node?.properties?.id
      })
    }
  })
}
