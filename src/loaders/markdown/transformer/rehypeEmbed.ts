import type { Root } from 'hast';
import path from 'path';
import type { Transformer } from 'unified';
import url from 'url';
import type { IMdTransformerOptions } from '.';

let visit: typeof import('unist-util-visit').visit;

(async () => {
  ({ visit } = await import('unist-util-visit'));
})();

export default function rehypeEmbed(
  opts: Pick<IMdTransformerOptions, 'fileAbsPath'>,
): Transformer<Root> {
  return async (tree) => {
    visit<Root, 'element'>(tree, 'element', (node, idx, parent) => {
      if (node.tagName === 'embed' && node.properties?.hasOwnProperty('src')) {
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

          // process node via file type
          switch (path.extname(parsed.pathname!)) {
            case '.md':
            default:
              // TODO: merge slugs
              parent?.children.splice(idx!, 1, {
                type: 'element',
                tagName: 'React.Fragment',
                children: [],
                properties: {},
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
        }
      }
    });
  };
}
