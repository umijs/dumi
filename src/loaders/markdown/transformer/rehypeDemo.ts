import parseBlockAsset, { type IParsedBlockAsset } from '@/assetParsers/block';
import type { IDumiDemoProps } from '@/client/theme-api/DumiDemo';
import {
  getContentHash,
  getFileIdFromFsPath,
  parseCodeFrontmatter,
} from '@/utils';
import type { sync } from 'enhanced-resolve';
import fs from 'fs';
import type { Element, Root } from 'hast';
import path from 'path';
import { logger, winPath } from 'umi/plugin-utils';
import type { Transformer } from 'unified';
import type { DataMap } from 'vfile';
import type { IMdTransformerOptions } from '.';
import {
  getDemoOverlayResourceQuery,
  getDemoResourceQuery,
  isDemoOverlayQuery,
} from '../demoQuery';

let visit: typeof import('unist-util-visit').visit;
let SKIP: typeof import('unist-util-visit').SKIP;
let EXIT: typeof import('unist-util-visit').EXIT;
let toString: typeof import('hast-util-to-string').toString;
let isElement: typeof import('hast-util-is-element').isElement;
const DEMO_NODE_CONTAINER = '$demo-container';

export const DEMO_PROP_VALUE_KEY = '$demo-prop-value-key';
const DEMO_LOADER_PLACEHOLDER = '__DUMI_DEMO_LOADER__';
const DEMO_LOADER_PLACEHOLDER_VALUE =
  DEMO_LOADER_PLACEHOLDER as unknown as NonNullable<
    IDumiDemoProps['demo']['loader']
  >;
export const DUMI_DEMO_TAG = 'DumiDemo';
export const DUMI_DEMO_GRID_TAG = 'DumiDemoGrid';
export const SKIP_DEMO_PARSE = 'pure';
const ALWAYS_DEMO_PARSE = 'demo';

function createOverlayDemoAsset(opts: {
  id: string;
  refAtomIds: string[];
  fileAbsPath: string;
  fileLocale?: string;
  entryPointCode?: string;
}): IParsedBlockAsset {
  const source =
    opts.entryPointCode ?? fs.readFileSync(opts.fileAbsPath, 'utf-8');
  const { code, frontmatter: parsedFrontmatter } = parseCodeFrontmatter(source);
  const frontmatter = parsedFrontmatter
    ? { ...parsedFrontmatter }
    : parsedFrontmatter;
  const filename = `index${path.extname(opts.fileAbsPath)}`;
  const asset: IParsedBlockAsset['asset'] = {
    type: 'BLOCK',
    id: opts.id,
    refAtomIds: opts.refAtomIds,
    dependencies: {
      [filename]: { type: 'FILE', value: code },
    },
    entry: filename,
  };

  if (frontmatter) {
    ['description', 'title', 'snapshot', 'keywords'].forEach((key) => {
      asset[key as keyof IParsedBlockAsset['asset']] = frontmatter[key];
    });
    ['description', 'title'].forEach((key) => {
      frontmatter[key] =
        frontmatter[`${key}.${opts.fileLocale}`] || frontmatter[key];
    });
  }

  return {
    asset,
    frontmatter,
    resolveMap: { [filename]: opts.fileAbsPath },
  };
}

function getStableContentHash(value: unknown) {
  const serialized = JSON.stringify(value, (_key, nestedValue) => {
    if (
      nestedValue &&
      typeof nestedValue === 'object' &&
      !Array.isArray(nestedValue)
    ) {
      return Object.fromEntries(
        Object.keys(nestedValue)
          .sort()
          .map((key) => [key, nestedValue[key]]),
      );
    }

    return nestedValue;
  });

  return getContentHash(serialized);
}

const skipDemoRE = new RegExp(/** 注意前面有空格 ==> */ ` ${SKIP_DEMO_PARSE}`);
const alwaysDemoRE = new RegExp(
  /** 注意前面有空格 ==> */ ` ${ALWAYS_DEMO_PARSE}`,
);

// workaround to import pure esm module
(async () => {
  ({ visit, SKIP, EXIT } = await import('unist-util-visit'));
  ({ toString } = await import('hast-util-to-string'));
  ({ isElement } = await import('hast-util-is-element'));
})();

type IRehypeDemoOptions = Pick<
  IMdTransformerOptions,
  'techStacks' | 'cwd' | 'fileAbsPath' | 'resolve'
> & {
  resolver: typeof sync;
  fileLocaleLessPath: string;
  fileLocale?: string;
  useUtoopackDemoHMR?: boolean;
  demoOverlay?: boolean;
};

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
    [
      // 插件开发者可配置 [SKIP_DEMO_PARSE_SIGN] 表示不解析 demo (优先级最高)
      !Object.prototype.hasOwnProperty.call(node.data ?? {}, SKIP_DEMO_PARSE),
      Array.isArray(node.properties?.className),
      // 根据用户配置判断 pure 或者 demo
      opts.resolve.codeBlockMode === 'passive'
        ? alwaysDemoRE.test(String(node.data?.meta)) // passive mode
        : !skipDemoRE.test(String(node.data?.meta)), // active mode (default)
    ].every(Boolean)
  ) {
    // code block demo
    // ref: https://github.com/syntax-tree/mdast-util-to-hast/blob/b7623785f270b5225898d15327770327409878f8/lib/handlers/code.js#L23
    lang = String((node.properties!.className as any[])[0]).replace(
      'language-',
      '',
    );
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
  const prefix = atomId || getFileIdFromFsPath(path.relative(cwd, fileAbsPath));

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
    // sse an array to store all demo ids for subsequent repeat warnings
    const demoIds: string[] = [];
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
              while (nextChild) {
                if (
                  (isElement(nextChild, 'code') &&
                    tryMarkDemoNode(nextChild, opts)) ||
                  isElement(nextChild, 'br')
                ) {
                  // move to the next child index
                  splitFrom += 1;

                  // update next child for the next check
                  nextChildIndex = splitFrom + 1;
                  nextChild = node.children[nextChildIndex];
                } else {
                  splitFrom += 1;
                  break;
                }
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

    // find all demo nodes, and check whether there is `only` mark
    let hasOnlySign = false;
    let hasSkipSign = false;
    visit<Root, 'element'>(tree, 'element', (node) => {
      if (isElement(node, 'p') && node.data?.[DEMO_NODE_CONTAINER]) {
        for (const codeNode of node.children) {
          if (isElement(codeNode, 'code')) {
            hasSkipSign ||= 'skip' in codeNode.properties!;

            if ('only' in codeNode.properties!) {
              hasOnlySign = true;
              return EXIT;
            }
          }
        }
      }
    });

    if (process.env.NODE_ENV === 'production' && (hasOnlySign || hasSkipSign)) {
      logger.warn(
        `The 'only' or 'skip' mark is not supported in production environment, please remove it. at ${
          vFile.data.frontmatter!.filename
        }`,
      );
    }

    visit<Root, 'element'>(tree, 'element', (node) => {
      if (isElement(node, 'p') && node.data?.[DEMO_NODE_CONTAINER]) {
        const demosPropData: IDumiDemoProps[] = [];
        for (const codeNode of node.children) {
          // strip invalid br elements
          if (isElement(codeNode, 'code')) {
            // check whether to skip this demo
            const shouldSkipNonOnlyDemos =
              hasOnlySign && !('only' in codeNode.properties!);
            if (
              process.env.NODE_ENV !== 'production' &&
              ('skip' in codeNode.properties! || shouldSkipNonOnlyDemos)
            ) {
              continue;
            }

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
              lang: codeNode.data!.lang,
              fileLocale: opts.fileLocale,
              entryPointCode: codeType === 'external' ? undefined : codeValue,
              resolver: opts.resolver,
              techStack,
            };

            const runtimeOpts = techStack.runtimeOpts;

            const previewerProps: IDumiDemoProps['previewerProps'] = {};
            let component = '';

            if (codeType === 'external') {
              const chunkName = [vFile.data.frontmatter!.atomId, 'demos']
                .filter(Boolean)
                .join('__');

              // external demo options
              parseOpts.fileAbsPath = winPath(
                codeNode.properties!.src as string,
              );

              let localId =
                (codeNode.properties?.id as string) ??
                path.parse(
                  parseOpts.fileAbsPath.replace(/\/index\.(j|t)sx?$/, ''),
                ).name;

              parseOpts.id = getCodeId(
                opts.cwd,
                opts.fileLocaleLessPath,
                localId,
                vFile.data.frontmatter!.atomId,
              );
              const importChunk = `import( /* webpackChunkName: "${chunkName}" */ '${winPath(
                parseOpts.fileAbsPath,
              )}?techStack=${techStack.name}')`;

              if (runtimeOpts?.rendererPath) {
                component = `(async () => ${importChunk})()`;
              } else {
                component = `React.memo(React.lazy(() => ${importChunk}))`;
              }

              // use code value as title
              // TODO: force checking
              if (codeValue) codeNode.properties!.title = codeValue;
              codeNode.properties!.filename ??= winPath(
                path.relative(opts.cwd, parseOpts.fileAbsPath),
              );
            } else {
              const localId = [opts.fileLocale, String(index++)]
                .filter(Boolean)
                .join('-');

              // pass a fake entry point for code block demo
              // and pass the real code via `entryPointCode` option
              parseOpts.fileAbsPath = opts.fileAbsPath.replace(
                '.md',
                `.${parseOpts.lang}`,
              );
              parseOpts.id = getCodeId(
                opts.cwd,
                opts.fileLocaleLessPath,
                localId,
                vFile.data.frontmatter!.atomId,
              );
              component = techStack.transformCode(codeValue, {
                type: 'code-block',
                fileAbsPath: parseOpts.fileAbsPath,
              });
            }

            const propDemo: IDumiDemoProps['demo'] = { id: parseOpts.id };
            if (opts.useUtoopackDemoHMR) {
              propDemo.loader =
                `${DEMO_LOADER_PLACEHOLDER}${getDemoResourceQuery()}` as unknown as typeof DEMO_LOADER_PLACEHOLDER_VALUE;
            }
            demoIds.push(parseOpts.id);

            // generate asset data for demo
            const parsedAsset = opts.demoOverlay
              ? Promise.resolve(createOverlayDemoAsset(parseOpts))
              : parseBlockAsset({
                  ...parseOpts,
                  cacheable: opts.useUtoopackDemoHMR,
                });

            deferrers.push(
              parsedAsset.then(async ({ asset, resolveMap, frontmatter }) => {
                // repeat id to give warning
                if (
                  demoIds.indexOf(parseOpts.id) !==
                  demoIds.lastIndexOf(parseOpts.id)
                ) {
                  const startLine = node.position?.start.line;
                  const suffix = startLine ? `:${startLine}` : '';

                  logger.warn(
                    `Duplicate demo id found due to filename conflicts, please consider adding a unique id to code tag to resolve this.
        at ${opts.fileAbsPath}${suffix}`,
                  );
                }

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { src, className, ...restAttrs } =
                  codeNode.properties || {};
                const validAssetAttrs: ['title', 'snapshot', 'keywords'] = [
                  'title',
                  'snapshot',
                  'keywords',
                ];
                const techStackOpts = {
                  type: codeType,
                  mdAbsPath: opts.fileAbsPath,
                  fileAbsPath:
                    codeType === 'external' ? parseOpts.fileAbsPath : undefined,
                  entryPointCode: parseOpts.entryPointCode,
                };

                // transform empty string attr to boolean, such as `debug`, `iframe` & etc.
                Object.keys(restAttrs).forEach((key) => {
                  if (restAttrs[key] === '') restAttrs[key] = true;
                });

                // update previewer props after parse
                const originalProps = Object.assign({}, frontmatter, restAttrs);

                // copy valid props for asset
                validAssetAttrs.forEach((key) => {
                  if (originalProps[key]) asset[key] = originalProps[key];
                });

                const isInlineDemo = Boolean(
                  / inline/.test(String(codeNode.data?.meta)) ||
                    originalProps.inline,
                );
                const shouldDeferPreviewerProps = Boolean(
                  opts.useUtoopackDemoHMR &&
                    codeType === 'external' &&
                    !isInlineDemo &&
                    !runtimeOpts?.rendererPath &&
                    runtimeOpts?.deferPreviewerProps?.length,
                );

                if (opts.useUtoopackDemoHMR && !shouldDeferPreviewerProps) {
                  propDemo.version = getStableContentHash(asset.dependencies);
                }

                // do not generate previewer props & asset for inline demo
                if (isInlineDemo) {
                  // HINT: must keep the reference
                  propDemo.inline = true;

                  return {
                    // TODO: special id for inline demo
                    id: asset.id,
                    component,
                    renderOpts: {
                      rendererPath: runtimeOpts?.rendererPath,
                      preflightPath: runtimeOpts?.preflightPath,
                    },
                  };
                }

                // HINT: must use `Object.assign` to keep the reference
                Object.assign(
                  previewerProps,
                  (await techStack.generatePreviewerProps?.(
                    originalProps,
                    techStackOpts,
                  )) || originalProps,
                );

                // md to string for asset metadata
                // md to html for previewer props
                if (previewerProps.description) {
                  const { unified } = await import('unified');
                  const { default: remarkParse } = await import('remark-parse');
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
                    .use(rehypeStringify, { allowDangerousHtml: true })
                    .process(previewerProps.description);

                  previewerProps.description = String(result.value);
                  asset.description = convert(result.value, {
                    wordwrap: false,
                  });
                }

                const finalAsset = techStack.generateMetadata
                  ? await techStack.generateMetadata(asset, techStackOpts)
                  : asset;
                /**
                 * keep `generateSources` rather than `generateResolveMap` for compatibility
                 */
                const finalResolveMap =
                  !opts.demoOverlay && techStack.generateSources
                    ? await techStack.generateSources(resolveMap, techStackOpts)
                    : resolveMap;
                const deferredPreviewerProps: Record<string, any> = {};
                const renderOpts = {
                  rendererPath: runtimeOpts?.rendererPath,
                  compilePath: runtimeOpts?.compilePath,
                  preflightPath: runtimeOpts?.preflightPath,
                };

                if (shouldDeferPreviewerProps) {
                  runtimeOpts!.deferPreviewerProps!.forEach((key) => {
                    if (key in previewerProps) {
                      deferredPreviewerProps[key] = (previewerProps as any)[
                        key
                      ];
                      delete (previewerProps as any)[key];
                    }
                  });

                  // Dependency and asset changes are carried by the
                  // self-accepted demo module and its semantic revision. Keep
                  // the page-side cache key structural so ordinary source,
                  // sidecar, and import-graph edits do not replace the whole
                  // Markdown page module.
                  propDemo.version = getStableContentHash({
                    component,
                    renderOpts,
                  });
                  propDemo.__dumiUtoopackHMR = winPath(
                    `${opts.fileAbsPath}${getDemoOverlayResourceQuery()}`,
                  );
                  propDemo.loader =
                    `${DEMO_LOADER_PLACEHOLDER}${getDemoOverlayResourceQuery()}` as unknown as typeof DEMO_LOADER_PLACEHOLDER_VALUE;
                }

                const dumiUtoopackHMRVersion = shouldDeferPreviewerProps
                  ? getStableContentHash({
                      component,
                      asset: finalAsset,
                      resolveMap: finalResolveMap,
                      previewerProps: deferredPreviewerProps,
                      renderOpts,
                    })
                  : undefined;

                // return demo data
                return {
                  id: asset.id,
                  component,
                  asset: finalAsset,
                  resolveMap: finalResolveMap,
                  ...(Object.keys(deferredPreviewerProps).length
                    ? { previewerProps: deferredPreviewerProps }
                    : {}),
                  ...(dumiUtoopackHMRVersion
                    ? { __dumiUtoopackHMRVersion: dumiUtoopackHMRVersion }
                    : {}),
                  ...(shouldDeferPreviewerProps
                    ? {
                        __dumiUtoopackDeferredPreviewerProps: [
                          ...runtimeOpts!.deferPreviewerProps!,
                        ],
                      }
                    : {}),
                  ...(shouldDeferPreviewerProps && runtimeOpts?.deferDemoSidecar
                    ? { __dumiUtoopackDeferredSidecar: true }
                    : {}),
                  renderOpts,
                };
              }),
            );

            // save into demos property
            demosPropData.push({
              demo: propDemo,
              previewerProps,
            });

            // only process demos with the first occurrence of `only` mark
            if (
              process.env.NODE_ENV !== 'production' &&
              'only' in codeNode.properties!
            ) {
              break;
            }
          }
        }

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
        let value = JSON.stringify(node.data![DEMO_PROP_VALUE_KEY]);

        if (opts.useUtoopackDemoHMR) {
          value = value.replace(
            new RegExp(`"${DEMO_LOADER_PLACEHOLDER}([^"]+)"`, 'g'),
            (_match, demoResourceQuery: string) => {
              const request = winPath(
                `${opts.fileAbsPath}${demoResourceQuery}`,
              );
              if (!isDemoOverlayQuery(demoResourceQuery)) {
                return `() => import(${JSON.stringify(request)})`;
              }

              const runtimeRequest = winPath(
                `${opts.fileAbsPath}${getDemoResourceQuery()}`,
              );

              return `() => Promise.all([import(${JSON.stringify(
                runtimeRequest,
              )}), import(${JSON.stringify(
                request,
              )})]).then(([runtime, overlay]) => mergeDemoModules(runtime, overlay))`;
            },
          );
        }

        if (node.JSXAttributes![0].type === 'JSXAttribute') {
          node.JSXAttributes![0].value = value;
        } else {
          node.JSXAttributes![0].argument = value;
        }
      });
    });
  };
}
