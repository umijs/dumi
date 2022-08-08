import { getRoutePathFromFsPath } from '@/utils';
import type { Element, Root } from 'hast';
import path from 'path';
import { winPath } from 'umi/plugin-utils';
import type { Transformer } from 'unified';
import type { IMdTransformerOptions, IMdTransformerResult } from './';

let visit: typeof import('unist-util-visit').visit;
let SKIP: typeof import('unist-util-visit').SKIP;
let toString: typeof import('mdast-util-to-string').toString;

// workaround to import pure esm module
(async () => {
  ({ visit, SKIP } = await import('unist-util-visit'));
  ({ toString } = await import('mdast-util-to-string'));
})();

type IRemarkDemoOptions = Pick<
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

  return `${prefix}-demo-${codeIndex}`;
}

export default function remarkDemo(
  opts: IRemarkDemoOptions,
): Transformer<Root> {
  return (tree, vFile) => {
    let index = 0;
    const demos: IMdTransformerResult['meta']['demos'] = [];

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
          const codeId = getCodeId(opts.cwd, opts.fileAbsPath, index++);

          if (hasSrc) {
            // external demo
            const codeAbsPath = path.resolve(
              path.dirname(opts.fileAbsPath),
              codeNode.properties!.src! as string,
            );

            demos.push({
              id: codeId,
              component: `React.lazy(() => import('${winPath(codeAbsPath)}'))`,
            });
          } else {
            // code block demo
            demos.push({
              id: codeId,
              component: techStack.transformCode(codeValue, {
                type: 'code-block',
                fileAbsPath: opts.fileAbsPath,
              }),
            });
          }

          // replace node
          node.tagName = 'DumiDemo';
          node.properties = { id: codeId };
          node.children = [];

          return SKIP;
        }
      }
    });

    vFile.data.demos = demos;
  };
}
