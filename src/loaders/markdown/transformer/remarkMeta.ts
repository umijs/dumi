import yaml from 'js-yaml';
import type { Root } from 'mdast';
import path from 'path';
import type { Root as YAMLRoot } from 'remark-frontmatter';
import { lodash } from 'umi/plugin-utils';
import type { Transformer } from 'unified';

let visit: typeof import('unist-util-visit').visit;
let toString: typeof import('mdast-util-to-string').toString;

// workaround to import pure esm module
(async () => {
  ({ visit } = await import('unist-util-visit'));
  ({ toString } = await import('mdast-util-to-string'));
})();

export default function remarkMeta(opts: {
  fileAbsPath: string;
}): Transformer<Root> {
  return (tree, file) => {
    // initialize frontmatter
    file.data.frontmatter = { title: '' };

    // read frontmatter
    visit<YAMLRoot, 'yaml'>(tree, 'yaml', (node) => {
      try {
        file.data.frontmatter = yaml.load(node.value) as any;
      } catch {}
    });

    // create title readers
    const titleReaders = [
      // use first heading as title
      () => {
        visit<Root, 'heading'>(tree, 'heading', (node) => {
          if (node.depth === 1) {
            file.data.frontmatter!.title = toString(node.children);
          }
        });
      },
      // use filename as title
      () => {
        const pathWithoutIndex = opts.fileAbsPath.replace(
          /(\/index([^/]+)?)?\.md$/,
          '',
        );

        file.data.frontmatter!.title = lodash.startCase(
          path.basename(pathWithoutIndex),
        );
      },
    ];

    // set title
    while (!file.data.frontmatter!.title && titleReaders.length) {
      titleReaders.shift()!();
    }
  };
}
