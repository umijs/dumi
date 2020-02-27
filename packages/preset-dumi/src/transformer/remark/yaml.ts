import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import slash from 'slash2';
import visit from 'unist-util-visit';
import transformer from '../index';

export default function yamlProcessor() {
  return (ast, vFile) => {
    if (this.data('fileAbsPath')) {
      const filePath = slash(path.relative(process.cwd(), this.data('fileAbsPath')));

      // append file info
      Object.assign(vFile.data, {
        filePath,
        updatedTime: Math.floor(fs.lstatSync(this.data('fileAbsPath')).ctimeMs),
      });
    }

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
}
