import { getTabKeyFromFile, isTabRouteFile } from '@/features/tabs';
import fs from 'fs';
import yaml from 'js-yaml';
import type { Root } from 'mdast';
import path from 'path';
import type { Root as YAMLRoot } from 'remark-frontmatter';
import { lodash, winPath } from 'umi/plugin-utils';
import type { Transformer } from 'unified';
import type { IMdTransformerOptions } from '.';

let visit: typeof import('unist-util-visit').visit;
let toString: typeof import('mdast-util-to-string').toString;

// workaround to import pure esm module
(async () => {
  ({ visit } = await import('unist-util-visit'));
  ({ toString } = await import('mdast-util-to-string'));
})();

/**
 * guess atom id from filename
 */
function getGuessAtomId(opts: IRemarkMetaOpts) {
  const parsed = path.parse(opts.fileAbsPath);
  // strip modifier from markdown filename, such as $tab-xx, zh-CN & etc.
  const clearFileName = parsed.name.replace(
    /(?:\.$tab-[^.]+)?(?:\.[^.]+)?(\.[^.]+)$/,
    '$1',
  );
  // find same name component file
  const atomFile = ['.tsx', '.jsx']
    .map((ext) => path.join(parsed.dir, `${clearFileName}${ext}`))
    .find(fs.existsSync);

  if (atomFile) {
    // generate absolute atom resolve dir
    const atomAbsDir = opts.resolve.atomDirs
      .map(({ dir }) => path.resolve(opts.cwd, dir))
      .sort((a, b) => b.split('/').length - a.split('/').length)
      .find((dir) => atomFile.startsWith(dir));

    // only collect atom files within atom resolve dir
    if (atomAbsDir) {
      return path
        .relative(atomAbsDir, atomFile)
        .replace(/((^|\/)index)?\.\w+$/, '');
    }
  }
}

type IRemarkMetaOpts = Pick<
  IMdTransformerOptions,
  'cwd' | 'fileAbsPath' | 'resolve'
>;

export default function remarkMeta(opts: IRemarkMetaOpts): Transformer<Root> {
  return (tree, vFile) => {
    const guessAtomId = getGuessAtomId(opts);

    // initialize frontmatter
    vFile.data.frontmatter = {
      title: '',
      toc: 'menu',
      filename: winPath(path.relative(opts.cwd, opts.fileAbsPath)),
      ...(guessAtomId && { atomId: guessAtomId }),
    };

    // read frontmatter
    visit<YAMLRoot, 'yaml'>(tree, 'yaml', (node) => {
      try {
        Object.assign(vFile.data.frontmatter!, yaml.load(node.value) as any);
      } catch {}
    });

    // create title readers
    const titleReaders = [
      // use first heading as title
      () => {
        visit<Root, 'heading'>(tree, 'heading', (node) => {
          if (node.depth === 1) {
            vFile.data.frontmatter!.title = toString(node.children);
          }
        });
      },
      // use filename as title
      () => {
        if (isTabRouteFile(opts.fileAbsPath)) {
          vFile.data.frontmatter!.title = lodash.startCase(
            getTabKeyFromFile(opts.fileAbsPath),
          );
        } else {
          const pathWithoutIndex = opts.fileAbsPath.replace(
            /(\/index([^/]+)?)?\.md$/,
            '',
          );

          vFile.data.frontmatter!.title = lodash.startCase(
            path.basename(pathWithoutIndex),
          );
        }
      },
    ];

    // set title
    while (!vFile.data.frontmatter!.title && titleReaders.length) {
      titleReaders.shift()!();
    }
  };
}
