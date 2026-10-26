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
// trailing whitespace is tolerated, such as `<h3>Title {#id} </h3>`
const CUSTOM_ANCHOR_RE = /\s*\{#([^}]+)\}\s*$/;

/**
 * get the custom anchor id from plain heading text,
 * blank id (e.g. `{# }`) is not a valid marker
 */
function getCustomAnchorId(text: string) {
  return text.match(CUSTOM_ANCHOR_RE)?.[1].trim() || undefined;
}

/**
 * strip the trailing custom anchor marker from plain heading text,
 * keep text untouched if the marker is invalid
 */
export function stripCustomAnchorMarker(text: string) {
  return getCustomAnchorId(text) ? text.replace(CUSTOM_ANCHOR_RE, '') : text;
}

/**
 * strip the marker from the heading, and return the raw custom anchor id if matched.
 * the marker is syntax rather than content, so it is always removed
 */
function extractCustomAnchor(node: Element) {
  const lastChild = node.children[node.children.length - 1];

  // fast path: `{#` is a necessary condition of the marker regex,
  // so this check never skips a valid marker
  if (lastChild?.type !== 'text' || !lastChild.value.includes('{#')) return;

  const rawId = getCustomAnchorId(lastChild.value);

  // keep the text untouched if the marker is invalid, such as `{# }`
  if (!rawId) return;

  lastChild.value = stripCustomAnchorMarker(lastChild.value);

  // drop empty text node
  if (!lastChild.value) node.children.pop();

  return rawId;
}

export default function rehypeSlug(): Transformer<Root> {
  return async (tree, vFile) => {
    const slugger = new Slugger();
    /** resolved custom anchor id, only for headings without an existing id */
    const customAnchors = new Map<Element, string>();
    /** ids already taken by custom anchors, demos or existing heading ids */
    const reservedIds = new Set<string>();
    const demoIds = new Set<string>();
    const filename = vFile.data.frontmatter?.filename;

    // reserve demo anchors first, their ids are rendered by previewer and cannot be changed
    visit<Root, 'element'>(tree, 'element', (node) => {
      if (
        ![DUMI_DEMO_TAG, DUMI_DEMO_GRID_TAG].includes(node.tagName) ||
        !node.data?.[DEMO_PROP_VALUE_KEY]
      ) {
        return;
      }

      const demos = ([] as any).concat(
        node.data?.[DEMO_PROP_VALUE_KEY],
      ) as IDumiDemoProps[];

      demos.forEach(({ demo }) => {
        // inline demo renders no anchor
        if (demo.inline) return;

        demoIds.add(demo.id);
        // make slugger skip demo ids, so auto-generated slugs give way to them
        slugger.slug(demo.id);
      });
    });

    // collect custom anchors, they always win over auto-generated slugs
    visit<Root, 'element'>(tree, 'element', (node) => {
      if (!HEADING_TAGS.includes(node.tagName)) return;

      // existing id comes from raw HTML or other remark plugins, it always wins,
      // skip resolving the custom anchor to avoid redundant work
      if (node.properties?.id) {
        // the marker is still syntax rather than content, strip it for consistent text
        extractCustomAnchor(node);
        // reserve it, so auto-generated slugs will not conflict with it
        reservedIds.add(node.properties.id as string);

        return;
      }

      const rawId = extractCustomAnchor(node);

      if (!rawId) return;

      // custom anchor must be a valid slug, otherwise fallback to the slugged one
      const sluggedId = Slugger.slug(rawId);

      if (sluggedId !== rawId) {
        logger.warn(
          `Custom anchor "${rawId}" is not a valid slug, use "${sluggedId}" instead. at ${filename}`,
        );
      }

      let id = sluggedId;
      let suffix = 1;

      // demo anchors are rendered by previewer, so custom anchors must give way to them
      while (reservedIds.has(id) || demoIds.has(id)) {
        id = `${sluggedId}-${suffix++}`;
      }

      if (id !== sluggedId) {
        logger.warn(
          demoIds.has(sluggedId)
            ? `Custom anchor "${sluggedId}" conflicts with demo id, fallback to "${id}" instead. at ${filename}`
            : `Duplicate custom anchor "${sluggedId}", fallback to "${id}" instead. at ${filename}`,
        );
      }

      reservedIds.add(id);
      customAnchors.set(node, id);
    });

    vFile.data.toc = [];

    visit<Root, 'element'>(tree, 'element', (node) => {
      if (HEADING_TAGS.includes(node.tagName)) {
        const customAnchor = customAnchors.get(node);

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
              `Heading "${title}" conflicts with the anchor "${conflictedId}", fallback to "${id}" instead. at ${filename}`,
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
              // must keep the same id as previewer rendered anchor
              id: demo.id,
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
