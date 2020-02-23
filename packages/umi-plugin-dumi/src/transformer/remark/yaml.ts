import yaml from 'js-yaml';
import visit from 'unist-util-visit';

export default () => (ast, vFile) => {
  visit(ast, 'yaml', node => {
    // save frontmatter to data
    vFile.data = Object.assign(vFile.data || {}, yaml.safeLoad(node.value));
  });
};
