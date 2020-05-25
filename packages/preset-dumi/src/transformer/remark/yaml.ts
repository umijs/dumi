import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import slash from 'slash2';
import { execSync } from 'child_process';
import visit from 'unist-util-visit';
import transformer from '../index';
import ctx from '../../context';

export default function yamlProcessor() {
  return (ast, vFile) => {
    if (this.data('fileAbsPath')) {
      const filePath = slash(
        path.relative(ctx.umi?.cwd || process.cwd(), this.data('fileAbsPath')),
      );

      // append file info
      vFile.data.filePath = filePath;

      try {
        const updatedTime =
          parseInt(
            execSync(`git log -1 --format=%at ${this.data('fileAbsPath')}`, {
              stdio: 'pipe',
            }).toString(),
            10,
          ) * 1000;
        if (Number.isNaN(updatedTime)) {
          throw 'get updatedTime failed';
        }
        vFile.data.updatedTime = updatedTime;
      } catch (err) {
        vFile.data.updatedTime = Math.floor(fs.lstatSync(this.data('fileAbsPath')).mtimeMs);
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

      // parse markdown for desc in home page
      if (data.hero?.desc) {
        data.hero.desc = transformer.markdown(data.hero.desc).html;
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
