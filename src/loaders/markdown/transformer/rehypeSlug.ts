import type { IDumiDemoProps } from '@/client/theme-api/DumiDemo';
import { getFileContentByRegExp, getFileRangeLines } from '@/utils';
import fs from 'fs';
import Slugger from 'github-slugger';
import type { Root } from 'hast';
import type { Transformer } from 'unified';
import transformer, { type IMdTransformerOptions } from '.';
import {
  DEMO_PROP_VALUE_KEY,
  DUMI_DEMO_GRID_TAG,
  DUMI_DEMO_TAG,
} from './rehypeDemo';
import { EMBED_TAG, type IEmbedNodeData } from './rehypeEmbed';

let visit: typeof import('unist-util-visit').visit;
let toString: typeof import('hast-util-to-string').toString;
const sharedSluggers = new Map<string, InstanceType<typeof Slugger>>();

/**
 * get slugger instance by file path
 */
function getFileSlugger(fileAbsPath: string, parentAbsPath?: string) {
  // return parent slugger for embedded md file, to concat slugs
  if (parentAbsPath) return sharedSluggers.get(parentAbsPath)!;

  // return new slugger for top-level md file
  const slugger = new Slugger();

  sharedSluggers.set(fileAbsPath, slugger);

  return slugger;
}

// workaround to import pure esm module
(async () => {
  ({ visit } = await import('unist-util-visit'));
  ({ toString } = await import('hast-util-to-string'));
})();

export const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

export default function rehypeSlug(
  opts: IMdTransformerOptions,
): Transformer<Root> {
  return async (tree, vFile) => {
    // to avoid slugger conflict between same md file in different compilation at the same time
    const pathWithRandom = `${opts.fileAbsPath}?${Math.random()}`;
    const slugger = getFileSlugger(pathWithRandom, opts.parentAbsPath);
    // save all toc creator and execute them one by one after, because the visitor not support async
    // ref: https://github.com/syntax-tree/unist-util-visit-parents/issues/8
    const deferrers: (() => Promise<void> | void)[] = [];

    vFile.data.toc = [];
    visit<Root, 'element'>(tree, 'element', (node) => {
      if (HEADING_TAGS.includes(node.tagName)) {
        // handle headings in current doc
        const title = toString(node);
        const depth = Number(node.tagName.slice(1));

        // add to deferrers queue
        deferrers.push(() => {
          const id = slugger.slug(title);

          // add slug to heading node
          node.properties!.id = id;

          // add heading node to toc
          vFile.data.toc!.push({ id, depth, title });
        });
      } else if (node.data?.tagName === EMBED_TAG) {
        // handle toc in embedded doc
        const { fileAbsPath, query } = node.data as IEmbedNodeData;
        let content = fs.readFileSync(fileAbsPath, 'utf-8');

        // get content by query
        if (query.get('range')) {
          content = getFileRangeLines(content, query.get('range')!);
        } else if (query.get('regexp')) {
          content = getFileContentByRegExp(
            content,
            query.get('regexp')!,
            fileAbsPath,
          );
        }

        // add to deferrers queue
        deferrers.push(async () => {
          const {
            meta: { toc },
          } = await transformer(content, {
            ...opts,
            // to make sure slugs can be concat for nested md
            parentAbsPath: opts.parentAbsPath || pathWithRandom,
          });

          // add embedded toc to parent toc
          vFile.data.toc!.push(...toc!);
        });
      } else if (
        [DUMI_DEMO_TAG, DUMI_DEMO_GRID_TAG].includes(node.tagName) &&
        node.data?.[DEMO_PROP_VALUE_KEY]
      ) {
        // handle toc from demos
        const demos = ([] as any).concat(
          node.data?.[DEMO_PROP_VALUE_KEY],
        ) as IDumiDemoProps[];

        // add to deferrers queue
        deferrers.push(() => {
          demos.forEach(({ demo, previewerProps }) => {
            // do not collect inline demo & no title demo
            if (!demo.inline && previewerProps.title) {
              vFile.data.toc!.push({
                id: slugger.slug(demo.id),
                depth: vFile.data.frontmatter?.demo?.tocDepth || 3,
                title: previewerProps.title,
              });
            }
          });
        });
      }
    });

    // execute all toc creator
    for (let deferrer of deferrers) {
      await deferrer();
    }

    // release slugger
    sharedSluggers.delete(pathWithRandom);
  };
}
