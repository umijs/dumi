import fs from 'fs';
import path from 'path';
import slash from 'slash2';
import { execSync } from 'child_process';
import visit from 'unist-util-visit';
import type { YamlNode } from 'remark-frontmatter';
import type { IDumiUnifiedTransformer } from '.';
import transformer from '..';
import ctx from '../../context';
import yaml from '../../utils/yaml';
import { getModuleResolvePath } from '../../utils/moduleResolver';

/**
 * remark plugin for generate file meta
 */
export default function meta(): IDumiUnifiedTransformer {
  return (ast, vFile) => {
    if (this.data('fileAbsPath')) {
      const filePath = slash(path.relative(process.cwd(), this.data('fileAbsPath')));

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
      /* istanbul ignore if */
      if (Number.isNaN(Number(vFile.data.updatedTime))) {
        vFile.data.updatedTime = Math.floor(fs.lstatSync(this.data('fileAbsPath')).mtimeMs);
      }

      // try to find related component of this md
      if (/(?<!readme)(\.[\w-]+)?\.md/i.test(this.data('fileAbsPath'))) {
        try {
          getModuleResolvePath({
            extensions: ['.tsx'],
            basePath: process.cwd(),
            sourcePath: path.dirname(this.data('fileAbsPath')),
            silent: true,
          });

          // presume A is the related component of A/index.md
          // TODO: find component from entry file for a precise result
          vFile.data.componentName = path.basename(path.parse(this.data('fileAbsPath')).dir);
        } catch (err) {
          /* nothing */
        }
      }
    }

    // save frontmatters
    visit<YamlNode>(ast, 'yaml', node => {
      const data = yaml(node.value);

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

    // apply for assets command
    if (ctx.umi?.applyPlugins && vFile.data.componentName) {
      ctx.umi.applyPlugins({
        key: 'dumi.detectAtomAsset',
        type: ctx.umi.ApplyPluginsType.event,
        args: {
          identifier: vFile.data.componentName,
          name: vFile.data.title,
          keywords: vFile.data.keywords,
          uuid: vFile.data.uuid,
          // use to parse props from component file
          _sourcePath: path.join(path.dirname(this.data('fileAbsPath')), 'index.tsx'),
          ...(vFile.data.deprecated ? { deprecated: true } : {}),
        },
      });
    }
  };
}
