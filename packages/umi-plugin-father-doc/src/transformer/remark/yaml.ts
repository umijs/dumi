import yaml from 'js-yaml';
import visit from 'unist-util-visit';

export default () => (ast, vFile) => {
  visit(ast, 'yaml', (node) => {
    // save frontmatter to data
    vFile.data.frontmatter = Object.assign(
      vFile.data.frontmatter || {},
      yaml.safeLoad(node.value),
    );
  });
}
