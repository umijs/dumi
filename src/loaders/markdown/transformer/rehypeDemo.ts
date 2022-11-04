import parseBlockAsset from '@/assetParsers/block';
import type { IDumiDemoProps } from '@/client/theme-api/DumiDemo';
import { getRoutePathFromFsPath } from '@/utils';
import type { sync } from 'enhanced-resolve';
import type { Element, Root } from 'hast';
import path from 'path';
import { winPath } from 'umi/plugin-utils';
import type { Transformer } from 'unified';
import type { DataMap } from 'vfile';
import type { IMdTransformerOptions } from '.';

let visit: typeof import('unist-util-visit').visit;
let SKIP: typeof import('unist-util-visit').SKIP;
let toString: typeof import('hast-util-to-string').toString;
let isElement: typeof import('hast-util-is-element').isElement;
const DEMO_NODE_CONTAINER = '$demo-container';

export const DEMO_PROP_VALUE_KEY = '$demo-prop-value-key';
export const DUMI_DEMO_TAG = 'DumiDemo';
export const DUMI_DEMO_GRID_TAG = 'DumiDemoGrid';

// workaround to import pure esm module
(async () => {
  ({ visit, SKIP } = await import('unist-util-visit'));
  ({ toString } = await import('hast-util-to-string'));
  ({ isElement } = await import('hast-util-is-element'));
})();

type IRehypeDemoOptions = Pick<
  IMdTransformerOptions,
  'techStacks' | 'cwd' | 'fileAbsPath' | 'resolve'
> & { resolver: typeof sync };

/**
 * get language for code element
 */
function getCodeLang(node: Element, opts: IRehypeDemoOptions) {
  let lang = '';

  if (typeof node.properties?.src === 'string') {
    // external demo
    node.properties.src = opts.resolver(
      path.dirname(opts.fileAbsPath),
      node.properties.src,
    ) as string;
    lang = path.extname(node.properties.src).slice(1);
  } else if (
    Array.isArray(node.properties?.className) &&
    (opts.resolve.codeBlockMode === 'passive'
      ? // passive mode
        / demo/.test(String(node.data?.meta))
      : // active mode (default)
        !/ pure/.test(String(node.data?.meta)))
  ) {
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
  localId: string,
  atomId?: string,
) {
  // Foo, or docs-guide, or docs-guide-faq
  const prefix =
    atomId ||
    getRoutePathFromFsPath(path.relative(cwd, fileAbsPath)).replace(/\//g, '-');

  return [prefix.toLowerCase(), 'demo', localId.toLowerCase()]
    .filter(Boolean)
    .join('-');
}

/**
 * try to mark tech stack data for node, if it is a demo node
 */
function tryMarkDemoNode(node: Element, opts: IRehypeDemoOptions) {
  let isDemoNode = Boolean(node.data?.techStack);

  // to prevent duplicate mark
  if (!isDemoNode) {
    const lang = getCodeLang(node, opts);
    const techStack =
      lang && opts.techStacks.find((ts) => ts.isSupported(node, lang));

    // mark tech stack data for reuse
    if (techStack) {
      isDemoNode = true;
      node.data ??= {};
      node.data.techStack = techStack;
      node.data.lang = lang;
      node.data.type =
        typeof node.properties?.src === 'string' ? 'external' : 'code-block';
    }
  }

  return isDemoNode;
}

export default function rehypeDemo(
  opts: IRehypeDemoOptions,
): Transformer<Root> {
  return async (tree, vFile) => {
    const deferrers: Promise<DataMap['demos'][0]>[] = [];
    const replaceNodes: Element[] = [];
    let index = 0;

    // mark code block demo node to standard demo node
    // TODO: code block demo also support demo grid?
    visit<Root, 'element'>(tree, 'element', (node) => {
      if (
        isElement(node, 'pre') &&
        node.children.length === 1 &&
        isElement(node.children[0], 'code') &&
        tryMarkDemoNode(node.children[0], opts)
      ) {
        node.tagName = 'p';
        node!.data ??= {};
        node!.data[DEMO_NODE_CONTAINER] = true;
      }
    });

    // split demo node to a separate paragraph from a mixed paragraph
    visit<Root, 'element'>(tree, 'element', (node, nodeIndex, parent) => {
      if (isElement(node, 'p')) {
        for (
          let childIndex = 0;
          childIndex < node.children.length;
          childIndex += 1
        ) {
          let child = node.children[childIndex];

          // find code node
          if (isElement(child, 'code') && tryMarkDemoNode(child, opts)) {
            const isFirstChild = childIndex === 0;
            let nextChildIndex = childIndex + 1;
            let nextChild = node.children[nextChildIndex];
            let splitFrom = childIndex;

            if (isFirstChild) {
              // mark parent as demo container if the first child is demo node
              node!.data ??= {};
              node!.data[DEMO_NODE_CONTAINER] = true;

              // try to find the next demo node or br node
              while (
                nextChild &&
                ((isElement(nextChild, 'code') &&
                  tryMarkDemoNode(nextChild, opts)) ||
                  isElement(nextChild, 'br'))
              ) {
                // move to the next child index
                splitFrom += 1;

                // update next child for the next check
                nextChildIndex = splitFrom + 1;
                nextChild = node.children[nextChildIndex];
              }

              // if there has no next node, it means need not to split, SKIP directly
              if (!nextChild) return SKIP;
            }

            // split paragraph
            const splitChildren = node.children.splice(splitFrom);

            parent!.children.splice(nodeIndex! + 1, 0, {
              type: 'element',
              tagName: 'p',
              children: splitChildren,
            });

            return SKIP;
          }
        }
      }
    });

    visit<Root, 'element'>(tree, 'element', (node) => {
      if (isElement(node, 'p') && node.data?.[DEMO_NODE_CONTAINER]) {
        const demosPropData: IDumiDemoProps[] = [];

        node.children.forEach((codeNode) => {
          // strip invalid br elements
          if (isElement(codeNode, 'code')) {
            const codeType = codeNode.data!.type as Parameters<
              IRehypeDemoOptions['techStacks'][0]['transformCode']
            >[1]['type'];
            const techStack = codeNode.data!
              .techStack as IRehypeDemoOptions['techStacks'][0];
            const codeValue = toString(codeNode).trim();
            const parseOpts = {
              id: '',
              refAtomIds: vFile.data.frontmatter!.atomId
                ? [vFile.data.frontmatter!.atomId]
                : [],
              fileAbsPath: '',
              entryPointCode: codeType === 'external' ? undefined : codeValue,
              resolver: opts.resolver,
            };
            const previewerProps: IDumiDemoProps['previewerProps'] = {};
            let component = '';

            if (codeType === 'external') {
              // external demo options
              parseOpts.fileAbsPath = codeNode.properties!.src as string;
              parseOpts.id = getCodeId(
                opts.cwd,
                opts.fileAbsPath,
                path.parse(parseOpts.fileAbsPath).name,
                vFile.data.frontmatter!.atomId,
              );
              component = `React.lazy(() => import('${winPath(
                parseOpts.fileAbsPath,
              )}?techStack=${techStack.name}'))`;
              // use code value as title
              // TODO: force checking
              codeNode.properties!.title = codeValue || undefined;
              codeNode.properties!.filename ??= winPath(
                path.relative(opts.cwd, parseOpts.fileAbsPath),
              );
            } else {
              // pass a fake entry point for code block demo
              // and pass the real code via `entryPointCode` option
              parseOpts.fileAbsPath = opts.fileAbsPath.replace('.md', '.tsx');
              parseOpts.id = getCodeId(
                opts.cwd,
                opts.fileAbsPath,
                String(index++),
                vFile.data.frontmatter!.atomId,
              );
              component = techStack.transformCode(codeValue, {
                type: 'code-block',
                fileAbsPath: opts.fileAbsPath,
              });
            }

            const propDemo: IDumiDemoProps['demo'] = { id: parseOpts.id };

            // generate asset data for demo
            deferrers.push(
              parseBlockAsset(parseOpts).then(
                async ({ asset, sources, frontmatter }) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { src, className, ...restAttrs } =
                    codeNode.properties || {};
                  const validAssetAttrs: ['title', 'snapshot', 'keywords'] = [
                    'title',
                    'snapshot',
                    'keywords',
                  ];

                  // transform empty string attr to boolean, such as `debug`, `iframe` & etc.
                  Object.keys(restAttrs).forEach((key) => {
                    if (restAttrs[key] === '') restAttrs[key] = true;
                  });

                  // update previewer props after parse
                  const originalProps = Object.assign(
                    {},
                    frontmatter,
                    restAttrs,
                  );

                  // copy valid props for asset
                  validAssetAttrs.forEach((key) => {
                    if (originalProps[key]) asset[key] = originalProps[key];
                  });

                  // do not generate previewer props & asset for inline demo
                  if (
                    / inline/.test(String(codeNode.data?.meta)) ||
                    originalProps.inline
                  ) {
                    // HINT: must keep the reference
                    propDemo.inline = true;

                    return {
                      // TODO: special id for inline demo
                      id: asset.id,
                      component,
                    };
                  }

                  // HINT: must use `Object.assign` to keep the reference
                  Object.assign(
                    previewerProps,
                    (await techStack.generatePreviewerProps?.(originalProps, {
                      type: codeType,
                      mdAbsPath: opts.fileAbsPath,
                      fileAbsPath:
                        codeType === 'external'
                          ? parseOpts.fileAbsPath
                          : undefined,
                      entryPointCode: parseOpts.entryPointCode,
                    })) || originalProps,
                  );

                  // md to string for asset metadata
                  // md to html for previewer props
                  if (previewerProps.description) {
                    const { unified } = await import('unified');
                    const { default: remarkParse } = await import(
                      'remark-parse'
                    );
                    const { default: remarkGfm } = await import('remark-gfm');
                    const { default: remarkRehype } = await import(
                      'remark-rehype'
                    );
                    const { default: rehypeStringify } = await import(
                      'rehype-stringify'
                    );
                    const { convert } = require('html-to-text');
                    const result = await unified()
                      .use(remarkParse)
                      .use(remarkGfm)
                      .use(remarkRehype, { allowDangerousHtml: true })
                      .use(rehypeStringify)
                      .process(previewerProps.description);

                    previewerProps.description = String(result.value);
                    asset.description = convert(result.value, {
                      wordwrap: false,
                    });
                  }

                  // return demo data
                  return {
                    id: asset.id,
                    component,
                    asset: techStack.generateMetadata
                      ? await techStack.generateMetadata(asset)
                      : asset,
                    sources,
                  };
                },
              ),
            );

            // save into demos property
            demosPropData.push({
              demo: propDemo,
              previewerProps,
            });
          }
        });

        // replace original node, and save it for parse the final real jsx attributes after all deferrers resolved
        // because the final `previewerProps` depends on the async parse result from `parseBlockAsset`
        // but visitor always sync
        replaceNodes.push(node);
        node.children = [];

        if (demosPropData.length === 1) {
          // single demo
          node.tagName = DUMI_DEMO_TAG;
          node.data[DEMO_PROP_VALUE_KEY] = demosPropData[0];
          node.JSXAttributes = [{ type: 'JSXSpreadAttribute', argument: '' }];
        } else {
          // grid demo
          node.tagName = DUMI_DEMO_GRID_TAG;
          node.data[DEMO_PROP_VALUE_KEY] = demosPropData;
          node.JSXAttributes = [
            { type: 'JSXAttribute', name: 'items', value: '' },
          ];
        }

        return SKIP;
      }
    });

    // wait for asset data be generated
    await Promise.all(deferrers).then((demos) => {
      // to make sure the order of demos is correct
      vFile.data.demos = demos;

      // parse final value for jsx attributes
      replaceNodes.forEach((node) => {
        const value = JSON.stringify(node.data![DEMO_PROP_VALUE_KEY]);

        if (node.JSXAttributes![0].type === 'JSXAttribute') {
          node.JSXAttributes![0].value = value;
        } else {
          node.JSXAttributes![0].argument = value;
        }
      });
    });
  };
}
