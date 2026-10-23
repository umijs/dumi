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

function createRouteInfo(
  routes: IRehypeLinkOptions['routes'],
  hostAbsPath: string,
) {
  const pathsByFile = new Map<string | undefined, string>();
  const absPaths = new Set<string>();
  let currentRoute: IRehypeLinkOptions['routes'][string] | undefined;

  Object.values(routes).forEach((route) => {
    // Markdown links use the last matching route, while relative links use the first.
    pathsByFile.set(route.file, route.absPath);
    absPaths.add(route.absPath);
    if (!currentRoute && route.file === hostAbsPath) currentRoute = route;
  });

  return { pathsByFile, absPaths, currentRoute };
}

export default function rehypeLink(
  opts: IRehypeLinkOptions,
): Transformer<Root> {
  return (tree) => {
    const hostAbsPath = getHostForTabRouteFile(opts.fileAbsPath);
    let routeInfo: ReturnType<typeof createRouteInfo> | undefined;

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

        // skip external or special links:
        //   - http://www.example.com or mailto:xxx@example.com or data:image/xxx
        //   - //www.example.com
        if (parsedUrl.protocol || href.startsWith('//')) return SKIP;

        if (/\.md$/i.test(parsedUrl.pathname!)) {
          // handle markdown link
          const { pathsByFile } = (routeInfo ??= createRouteInfo(
            opts.routes,
            hostAbsPath,
          ));
          const absPath = winPath(
            path.resolve(hostAbsPath, '..', parsedUrl.pathname!),
          );

          if (pathsByFile.has(absPath)) {
            parsedUrl.pathname = pathsByFile.get(absPath)!;
          }
        } else if (parsedUrl.pathname && /^[^/]+/.test(parsedUrl.pathname)) {
          // handle relative link
          // transform relative link to absolute link
          // because react-router@6 and HTML href are different in processing relative link
          // e.g. in /a page, <Link to="./b">b</Link> will be resolved to /a/b in react-router@6
          //      but will be resolved to /b in <a href="./b">b</a>
          const { currentRoute, absPaths } = (routeInfo ??= createRouteInfo(
            opts.routes,
            hostAbsPath,
          ));

          if (!currentRoute) return;

          const basePath = currentRoute.absPath;
          const htmlTargetPath = url.resolve(basePath, parsedUrl.pathname!);
          const rr6TargetPath = winPath(
            path.resolve(basePath, parsedUrl.pathname!),
          );

          // use html way first
          parsedUrl.pathname = htmlTargetPath;

          // warn if user already use react-router@6 way
          if (!absPaths.has(htmlTargetPath) && absPaths.has(rr6TargetPath)) {
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
