import type { IDumiDemoProps } from '@/client/theme-api/DumiDemo';
import { logger } from '@umijs/utils';
import Slugger from 'github-slugger';
import type { Element, Root } from 'hast';
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

// custom anchor marker, e.g. `## Title {#custom-id}`, only the trailing marker is valid
export const CUSTOM_ANCHOR_RE = /\s*\{#([^}]+)\}$/;

function getCustomAnchor(node: Element) {
  // existing id comes from raw HTML or other remark plugins, keep it untouched
  if (node.properties?.id) return;

  const lastChild = node.children[node.children.length - 1];

  if (lastChild?.type !== 'text') return;

  return lastChild.value.match(CUSTOM_ANCHOR_RE)?.[1].trim() || undefined;
}

function stripCustomAnchor(node: Element) {
  const lastChild = node.children[node.children.length - 1];

  if (lastChild?.type !== 'text') return;

  lastChild.value = lastChild.value.replace(CUSTOM_ANCHOR_RE, '');

  // drop empty text node
  if (!lastChild.value) node.children.pop();
}

export default function rehypeSlug(): Transformer<Root> {
  return async (tree, vFile) => {
    const slugger = new Slugger();
    const customAnchors = new Map<Element, string>();
    const reservedIds = new Set<string>();
    const filename = vFile.data.frontmatter?.filename;

    // collect custom anchors first, they always win over auto-generated slugs
    visit<Root, 'element'>(tree, 'element', (node) => {
      if (!HEADING_TAGS.includes(node.tagName)) return;

      const rawId = getCustomAnchor(node);

      if (!rawId) return;

      const sluggedId = new Slugger().slug(rawId);

      if (sluggedId !== rawId) {
        logger.warn(
          `Custom anchor "${rawId}" is not a valid slug, use "${sluggedId}" instead. at ${filename}`,
        );
      }

      let id = rawId;
      let suffix = 1;

      while (reservedIds.has(id)) {
        id = `${rawId}-${suffix++}`;
      }

      if (id !== rawId) {
        logger.warn(
          `Duplicate custom anchor "${rawId}", fallback to "${id}" instead. at ${filename}`,
        );
      }

      reservedIds.add(id);
      customAnchors.set(node, id);
    });

    vFile.data.toc = [];
    visit<Root, 'element'>(tree, 'element', (node) => {
      if (HEADING_TAGS.includes(node.tagName)) {
        const customAnchor = customAnchors.get(node);

        // strip marker before collecting title
        if (customAnchor) stripCustomAnchor(node);

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

        node.properties ??= {};

        if (customAnchor) {
          node.properties.id = customAnchor;
        } else if (!node.properties.id) {
          let id = slugger.slug(title);
          const conflictedId = id;

          // auto-generated slug should give way to custom anchors
          while (reservedIds.has(id)) {
            id = slugger.slug(title);
          }

          if (id !== conflictedId) {
            logger.warn(
              `Heading "${title}" conflicts with custom anchor "${conflictedId}", fallback to "${id}" instead. at ${filename}`,
            );
          }

          node.properties.id = id;
        }

        // add heading node to toc
        vFile.data.toc!.push({
          id: node.properties.id as string,
          depth,
          title,
        });
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
