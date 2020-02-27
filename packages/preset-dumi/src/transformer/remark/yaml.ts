import yaml from 'js-yaml';
import visit from 'unist-util-visit';
import transformer from '../index';

export default () => (ast, vFile) => {
  visit(ast, 'yaml', node => {
    const data = yaml.safeLoad(node.value);

    // parse markdown for features in home page
    if (data.features) {
      data.features.forEach(feat => {
        if (feat.desc) {
          feat.desc = transformer.markdown(feat.desc).html;
        }
      });
    }

    // save frontmatter to data
    vFile.data = Object.assign(vFile.data || {}, data);
  });
};
