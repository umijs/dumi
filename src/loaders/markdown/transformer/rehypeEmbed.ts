import type { Node, Root } from 'hast';
import path from 'path';
import type { Transformer } from 'unified';
import url from 'url';
import type { IMdTransformerOptions } from '.';

let visit: typeof import('unist-util-visit').visit;

(async () => {
  ({ visit } = await import('unist-util-visit'));
})();

export type IEmbedNodeData = Node['data'] & {
  tagName: string;
  fileAbsPath: string;
  query: InstanceType<typeof url.URLSearchParams>;
};

export const EMBED_TAG = 'embed';

export default function rehypeEmbed(
  opts: Pick<IMdTransformerOptions, 'fileAbsPath'>,
): Transformer<Root> {
  return async (tree, vFile) => {
    visit<Root, 'element'>(tree, 'element', (node, idx, parent) => {
      if (
        node.tagName === EMBED_TAG &&
        node.properties?.hasOwnProperty('src')
      ) {
        const { src } = node.properties;
        const parsed = url.parse(src?.toString() || '');
        const absPath = path.resolve(
          path.parse(opts.fileAbsPath).dir,
          parsed.pathname!,
        );

        if (absPath) {
          const hash = decodeURIComponent(parsed.hash || '').replace('#', '');
          const query = new URLSearchParams();

          // generate loader query
          if (hash[0] === 'L') {
            query.append('range', hash);
          } else if (hash.startsWith('RE-')) {
            query.append('regexp', hash.substring(3));
          }

          const moduleReqPath = `${absPath}?${query}`;
          const nodeData: IEmbedNodeData = {
            tagName: EMBED_TAG,
            fileAbsPath: absPath,
            query,
          };

          // process node via file type
          switch (path.extname(parsed.pathname!)) {
            case '.md':
            default:
              parent?.children.splice(idx!, 1, {
                type: 'element',
                tagName: 'React.Fragment',
                children: [],
                properties: {},
                data: nodeData,
                position: node.position,
                JSXAttributes: [
                  {
                    type: 'JSXAttribute',
                    name: 'children',
                    value: `require('${moduleReqPath}').default()`,
                  },
                ],
              });
          }

          // record embed file path for declare loader dependency
          vFile.data.embeds ??= [];
          vFile.data.embeds.push(absPath);
        }
      }
    });
  };
}
