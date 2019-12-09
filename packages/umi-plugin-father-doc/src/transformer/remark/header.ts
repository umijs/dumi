import visit from 'unist-util-visit';

export default () => (ast, vFile) => {
  visit(ast, 'heading', (node) => {
    // save subLayoutData to data
    if (!vFile.data.routeLayout) {
      vFile.data.routeLayout = []
    }
    vFile.data.routeLayout.push(node)
  });
}
