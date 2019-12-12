import visit from 'unist-util-visit';
import has from 'hast-util-has-property';
import is from 'hast-util-is-element';

const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
export default () => (ast, vFile) => {
  visit(ast, 'element', (node) => {
    if (is(node, headings) && has(node, 'id')) {
      if (!vFile.data.routeLayout) {
        vFile.data.routeLayout = []
      }
      vFile.data.routeLayout.push(node)
    }
  })
}
