import type { IDumiDemoProps } from '@/client/theme-api/DumiDemo';
import Slugger from 'github-slugger';
import type { Root } from 'hast';
import type { Transformer } from 'unified';
import {
  DEMO_PROP_VALUE_KEY,
  DUMI_DEMO_GRID_TAG,
  DUMI_DEMO_TAG,
} from './rehypeDemo';

let visit: typeof import('unist-util-visit').visit;
let toString: typeof import('hast-util-to-string').toString;

// workaround to import pure esm module
(async () => {
  ({ visit } = await import('unist-util-visit'));
  ({ toString } = await import('hast-util-to-string'));
})();

export const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

export default function rehypeSlug(): Transformer<Root> {
  return async (tree, vFile) => {
    const slugger = new Slugger();

    vFile.data.toc = [];
    visit<Root, 'element'>(tree, 'element', (node) => {
      if (HEADING_TAGS.includes(node.tagName)) {
        // handle headings in current doc
        const title = toString({
          type: 'element',
          tagName: node.tagName,
          // discard text within Badge tag
          children: node.children.filter(
            (child) => child.type !== 'element' || child.tagName !== 'Badge',
          ),
        }).trim();
        const depth = Number(node.tagName.slice(1));
        const id = slugger.slug(title);

        // add slug to heading node
        node.properties!.id = id;

        // add heading node to toc
        vFile.data.toc!.push({ id, depth, title });
      } else if (
        [DUMI_DEMO_TAG, DUMI_DEMO_GRID_TAG].includes(node.tagName) &&
        node.data?.[DEMO_PROP_VALUE_KEY]
      ) {
        // handle toc from demos
        const demos = ([] as any).concat(
          node.data?.[DEMO_PROP_VALUE_KEY],
        ) as IDumiDemoProps[];

        demos.forEach(({ demo, previewerProps }) => {
          // do not collect inline demo & no title demo
          if (!demo.inline && previewerProps.title) {
            vFile.data.toc!.push({
              id: slugger.slug(demo.id),
              depth: vFile.data.frontmatter?.demo?.tocDepth || 3,
              title: previewerProps.title,
              // put debug flag to control hide/show in toc
              ...(previewerProps.debug ? { _debug_demo: true } : {}),
            });
          }
        });
      }
    });
  };
}
