import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import slash from 'slash2';
import { execSync } from 'child_process';
import visit from 'unist-util-visit';
import transformer from '../index';

export default function yamlProcessor() {
  return (ast, vFile) => {
    if (this.data('fileAbsPath')) {
      const filePath = slash(path.relative(process.cwd(), this.data('fileAbsPath')));

      // append file info
      vFile.data.filePath = filePath;
      try {
        vFile.data.updatedTime =
          parseInt(
            execSync(`git log -1 --format=%at ${this.data('fileAbsPath')}`, {
              stdio: 'pipe',
            }).toString(),
            10,
          ) * 1000;
        vFile.data.fileCommits =
          execSync(`git log --format=%H ${this.data('fileAbsPath')}`, {
            stdio: 'pipe',
          }).toString().split('\n');
      } catch (err) {
        vFile.data.updatedTime = Math.floor(fs.lstatSync(this.data('fileAbsPath')).mtimeMs);
        vFile.data.fileCommits = [];
      }
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

      // parse markdown for footer in home page
      if (data.footer) {
        data.footer = transformer.markdown(data.footer).html;
      }

      // save frontmatter to data
      vFile.data = Object.assign(vFile.data || {}, data);
    });
  };
}
