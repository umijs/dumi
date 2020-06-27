import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import slash from 'slash2';
import { execSync } from 'child_process';
import visit from 'unist-util-visit';
import transformer from '..';
import ctx from '../../context';

/**
 * remark plugin for generate file meta
 */
export default function yamlProcessor() {
  return (ast, vFile) => {
    if (this.data('fileAbsPath')) {
      const filePath = slash(
        path.relative(ctx.umi?.cwd || process.cwd(), this.data('fileAbsPath')),
      );

      // append file info
      vFile.data.filePath = filePath;

      // try to read file update time from git history
      try {
        vFile.data.updatedTime =
          parseInt(
            execSync(`git log -1 --format=%at ${this.data('fileAbsPath')}`, {
              stdio: 'pipe',
            }).toString(),
            10,
          ) * 1000;
      } catch (err) {
        /* nothing */
      }

      // fallback to file update time
      if (Number.isNaN(vFile.data.updatedTime)) {
        vFile.data.updatedTime = Math.floor(fs.lstatSync(this.data('fileAbsPath')).mtimeMs);
      }
    }

    // save frontmatters
    visit(ast, 'yaml', node => {
      const data = yaml.safeLoad(node.value as string);

      // parse markdown for features in home page
      if (data.features) {
        data.features.forEach(feat => {
          if (feat.desc) {
            feat.desc = transformer.markdown(feat.desc, null, { type: 'html' }).content;
          }
        });
      }

      // parse markdown for desc in home page
      if (data.hero?.desc) {
        data.hero.desc = transformer.markdown(data.hero.desc, null, { type: 'html' }).content;
      }

      // parse markdown for footer in home page
      if (data.footer) {
        data.footer = transformer.markdown(data.footer, null, { type: 'html' }).content;
      }

      // save frontmatter to data
      vFile.data = Object.assign(vFile.data || {}, data);
    });
  };
}
