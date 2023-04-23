import { getHostForTabRouteFile } from '@/features/tabs';
import type { Root } from 'hast';
import path from 'path';
import { lodash, logger, winPath } from 'umi/plugin-utils';
import type { Transformer } from 'unified';
import url from 'url';
import type { IMdTransformerOptions } from '.';

let visit: typeof import('unist-util-visit').visit;
let SKIP: typeof import('unist-util-visit').SKIP;

// workaround to import pure esm module
(async () => {
  ({ visit, SKIP } = await import('unist-util-visit'));
})();

type IRehypeLinkOptions = Pick<IMdTransformerOptions, 'fileAbsPath' | 'routes'>;

export default function rehypeLink(
  opts: IRehypeLinkOptions,
): Transformer<Root> {
  return (tree) => {
    visit<Root, 'element'>(tree, 'element', (node, i, parent) => {
      if (
        node.tagName === 'a' &&
        typeof node.properties?.href === 'string' &&
        // skip target specified link
        !node.properties?.target &&
        // skip download link
        !node.properties?.download
      ) {
        const href = node.properties.href;
        const parsedUrl = url.parse(href);
        const hostAbsPath = getHostForTabRouteFile(opts.fileAbsPath);

        // skip external or special links:
        //   - http://www.example.com or mailto:xxx@example.com or data:image/xxx
        //   - //www.example.com
        if (parsedUrl.protocol || href.startsWith('//')) return SKIP;

        if (/\.md$/i.test(parsedUrl.pathname!)) {
          // handle markdown link
          const { routes } = opts;
          const absPath = winPath(
            path.resolve(hostAbsPath, '..', parsedUrl.pathname!),
          );

          Object.keys(routes).forEach((key) => {
            if (routes[key].file === absPath) {
              parsedUrl.pathname = routes[key].absPath;
            }
          });
        } else if (parsedUrl.pathname && /^[^/]+/.test(parsedUrl.pathname)) {
          // handle relative link
          // transform relative link to absolute link
          // because react-router@6 and HTML href are different in processing relative link
          // e.g. in /a page, <Link to="./b">b</Link> will be resolved to /a/b in react-router@6
          //      but will be resolved to /b in <a href="./b">b</a>
          const routes = Object.values(opts.routes);
          const basePath = routes.find(
            (route) => route.file === hostAbsPath,
          )!.absPath;
          const htmlTargetPath = url.resolve(basePath, parsedUrl.pathname!);
          const rr6TargetPath = winPath(
            path.resolve(basePath, parsedUrl.pathname!),
          );

          // use html way first
          parsedUrl.pathname = htmlTargetPath;

          // warn if user already use react-router@6 way
          if (
            routes.every((route) => route.absPath !== htmlTargetPath) &&
            routes.some((route) => route.absPath === rr6TargetPath)
          ) {
            parsedUrl.pathname = rr6TargetPath;
            logger.warn(
              `Detected ambiguous link \`${href}\` in \`${opts.fileAbsPath}\`, please use \`./xxx.md\` file path instead of normal relative path, dumi will deprecate this behavior in the future.
        See more: https://github.com/umijs/dumi/pull/1491`,
            );
          }
        }

        parent!.children.splice(i!, 1, {
          type: 'element',
          tagName: 'Link',
          children: node.children,
          properties: {
            ...lodash.omit(node.properties, ['href']),
            to: url.format(parsedUrl),
          },
        });
      }
    });
  };
}
