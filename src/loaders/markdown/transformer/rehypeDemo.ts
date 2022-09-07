import parseBlockAsset from '@/assetParsers/block';
import { getRoutePathFromFsPath } from '@/utils';
import type { Element, Root } from 'hast';
import type { DataMap } from 'vfile';
import path from 'path';
import { winPath } from 'umi/plugin-utils';
import type { Transformer } from 'unified';
import type { IMdTransformerOptions } from '.';

let visit: typeof import('unist-util-visit').visit;
let SKIP: typeof import('unist-util-visit').SKIP;
let toString: typeof import('mdast-util-to-string').toString;

// workaround to import pure esm module
(async () => {
  ({ visit, SKIP } = await import('unist-util-visit'));
  ({ toString } = await import('mdast-util-to-string'));
})();

type IRehypeDemoOptions = Pick<
  IMdTransformerOptions,
  'techStacks' | 'cwd' | 'fileAbsPath'
>;

/**
 * get language for code element
 */
function getCodeLang(node: Element) {
  let lang = '';

  // TODO: inline demo
  if (typeof node.properties?.src === 'string') {
    // external demo
    // TODO: resolve module without extension
    lang = path.extname(node.properties.src).slice(1);
  } else if (Array.isArray(node.properties?.className)) {
    // code block demo
    // ref: https://github.com/syntax-tree/mdast-util-to-hast/blob/b7623785f270b5225898d15327770327409878f8/lib/handlers/code.js#L23
    lang = String(node.properties!.className[0]).replace('language-', '');
  }

  return lang;
}

/**
 * get unique id for code in project
 */
function getCodeId(
  cwd: string,
  fileAbsPath: string,
  codeIndex: number,
  entityName?: string,
) {
  // Foo, or docs-guide, or docs-guide-faq
  const prefix =
    entityName ||
    getRoutePathFromFsPath(path.relative(cwd, fileAbsPath)).replace(/\//g, '-');

  return [prefix, 'demo', String(codeIndex)].filter(Boolean).join('-');
}

export default function rehypeDemo(
  opts: IRehypeDemoOptions,
): Transformer<Root> {
  return async (tree, vFile) => {
    const deferrers: Promise<DataMap['demos'][0]>[] = [];
    let index = 0;

    visit<Root, 'element'>(tree, 'element', (node) => {
      if (
        // BREAKING CHANGE: code tag must occupy a single line
        // code block will be wrapped in <pre> & code tag should be wrapped in <p>
        ['pre', 'p'].includes(node.tagName) &&
        node.children.length === 1 &&
        node.children[0].type === 'element' &&
        node.children[0].tagName === 'code'
      ) {
        const codeNode = node.children[0];
        const techStack = opts.techStacks.find((ts) =>
          ts.isSupported(codeNode, getCodeLang(codeNode)),
        );
        const hasSrc = typeof codeNode.properties?.src === 'string';
        const codeValue = toString(codeNode.children).trim();

        if (techStack && (hasSrc || codeValue)) {
          // TODO: use external demo filename as id
          const codeId = getCodeId(opts.cwd, opts.fileAbsPath, index++);
          const codeAbsPath =
            hasSrc &&
            path.resolve(
              path.dirname(opts.fileAbsPath),
              codeNode.properties!.src! as string,
            );
          const parseOpts = {
            id: codeId,
            // TODO: parse atom id
            refAtomIds: [],
            fileAbsPath: codeAbsPath
              ? codeAbsPath
              : // pass a fake entry point for code block demo
                // and pass the real code via `entryPointCode` option below
                opts.fileAbsPath.replace('.md', '.tsx'),
            entryPointCode: codeAbsPath ? undefined : codeValue,
          };

          // generate asset data for demo
          deferrers.push(
            parseBlockAsset(parseOpts).then(async ({ asset, sources }) => {
              const component = codeAbsPath
                ? // external demo
                  `React.lazy(() => import('${winPath(codeAbsPath)}?techStack=${
                    techStack.name
                  }'))`
                : // code block demo
                  techStack.transformCode(codeValue, {
                    type: 'code-block',
                    fileAbsPath: opts.fileAbsPath,
                  });

              // allow override description by `code` attr
              // TODO: locale support for title & description
              if (codeNode.properties?.description) {
                asset.description = String(codeNode.properties.description);
              }

              // allow override title by `code` innerText
              if (hasSrc && codeValue) {
                asset.title = codeValue;
              }

              return {
                id: asset.id,
                component,
                asset: techStack.generateMetadata
                  ? await techStack.generateMetadata(asset)
                  : asset,
                sources,
              };
            }),
          );

          // replace node
          node.tagName = 'DumiDemo';
          node.properties = { id: codeId };
          node.children = [];

          return SKIP;
        }
      }
    });

    // wait for asset data be generated
    await Promise.all(deferrers).then((demos) => {
      // to make sure the order of demos is correct
      vFile.data.demos = demos;
    });
  };
}
