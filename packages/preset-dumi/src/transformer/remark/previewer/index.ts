import fs from 'fs';
import path from 'path';
import type { Node } from 'unist';
import type { Visitor } from 'unist-util-visit';
import visit from 'unist-util-visit';
import { createDebug } from '@umijs/utils';
import slash from 'slash2';
import ctx from '../../../context';
import demoTransformer, { DEMO_COMPONENT_NAME } from '../../demo';
import transformer from '../..';
import {
  encodeImportRequire,
  decodeImportRequireWithAutoDynamic,
  encodeHoistImport,
  decodeHoistImportToContent,
} from '../../utils';
import builtinTransformer from './builtin';
import { listenFileOnceChange } from '../../../utils/watcher';
import type { ExampleBlockAsset } from 'dumi-assets-types';
import type { IDumiElmNode, IDumiUnifiedTransformer } from '..';
import type { IPreviewerTransformer, IPreviewerTransformerResult } from './builtin';

interface ICurryingPreviewerTransformer extends IPreviewerTransformer {
  fn: () => IPreviewerTransformerResult;
}

type ICurryingCodeTransformer = (props: IPreviewerTransformerResult['rendererProps']) => string;

const debug = createDebug('dumi:previewer');
export const previewerTransforms: IPreviewerTransformer[] = [builtinTransformer];

/**
 * cache id for each external demo file
 */
const externalCache = new Map<string, string>();
/**
 * record external demo id count
 */
const externalIdMap = new Map<string, number>();
/**
 * record code block demo id count
 */
const mdCodeBlockIdMap = new Map<string, { id: string; count: number; map: Map<string, number> }>();

/**
 * get unique id for previewer
 * @param yaml          meta data
 * @param mdAbsPath     md absolute path
 * @param codeAbsPath   code absolute path, it is seem as mdAbsPath for embed demo
 */
function getPreviewerId(yaml: any, mdAbsPath: string, codeAbsPath: string) {
  let id = yaml.identifier || yaml.uuid;

  // do not generate identifier for inline demo
  if (yaml.inline) {
    return;
  }

  if (!id) {
    if (mdAbsPath === codeAbsPath) {
      // for code block demo, format: component-demo-N
      const idMap = mdCodeBlockIdMap.get(mdAbsPath);
      id = [idMap.id, idMap.count, 'demo'].filter(Boolean).join('-');

      // record id count
      const currentIdCount = idMap.map.get(id) || 0;

      idMap.map.set(id, currentIdCount + 1);

      // append count suffix
      id += currentIdCount ? `-${currentIdCount}` : '';
    } else {
      // for external demo, format: dir-file-N
      // use cache first
      id = externalCache.get(codeAbsPath);

      if (!id) {
        const words = (slash(codeAbsPath) as string)
          // discard index & suffix like index.tsx
          .replace(/(?:\/index)?(\.[\w-]+)?\.\w+$/, '$1')
          .split(/\//)
          .map(w => w.toLowerCase());
        // /path/to/index.tsx -> to || /path/to.tsx -> to
        const demoName = words[words.length - 1] || 'demo';
        const prefix = words
          .slice(0, -1)
          .filter(word => !/^(src|_?demos?|_?examples?)$/.test(word))
          .pop();

        id = `${prefix}-${demoName}`;

        // record id count
        const currentIdCount = externalIdMap.get(id) || 0;

        externalIdMap.set(id, currentIdCount + 1);

        // append count suffix
        id += currentIdCount ? `-${currentIdCount}` : '';

        externalCache.set(codeAbsPath, id);
      }
    }
  }

  return id;
}

/**
 * get demo dependencies meta data from previewer props
 * @param props previewer props
 * @param lang  node lang
 */
function getDemoDeps(
  props: IPreviewerTransformerResult['previewerProps'],
  lang: string,
): ExampleBlockAsset['dependencies'] {
  return {
    // append npm dependencies
    ...Object.entries(props.dependencies || {}).reduce(
      (deps, [pkg, { version }]) =>
        Object.assign(deps, {
          [pkg]: {
            type: 'NPM',
            // TODO: get real version rule from package.json
            value: version,
          },
        }),
      {},
    ),
    // append local file dependencies
    ...Object.entries(props.sources).reduce(
      (result, [file, item]) =>
        Object.assign(result, {
          // handle legacy main file
          ...(file === '_'
            ? {
                [`index.${lang}`]: {
                  type: 'FILE',
                  value: decodeHoistImportToContent(Object.values(item)[0] as string),
                },
              }
            : {
                [file]: {
                  type: 'FILE',
                  value: item.content || fs.readFileSync(item.path, 'utf-8').toString(),
                },
              }),
        }),
      {},
    ),
  };
}

/**
 * get demo dependent files from previewer props
 * @param props         previewer props
 * @param demoFilePath  demo file path
 */
function getDependentFiles(
  props: IPreviewerTransformerResult['previewerProps'],
  demoFilePath?: string,
) {
  return Object.entries(props.sources)
    .map(([file, val]) => (file === '_' ? demoFilePath : val.path))
    .filter(Boolean);
}

/**
 * transform demo node to real component
 * @param node          demo node
 * @param mdAbsPath     md absolute path
 * @param pTransformer  previewer transformer
 * @param rendererProps demo render props
 */
function transformCode(
  node: IDumiElmNode,
  mdAbsPath: string,
  pTransformer: ICurryingPreviewerTransformer,
  rendererProps: IPreviewerTransformerResult['rendererProps'],
) {
  // export third-party transformer directly
  if (pTransformer.type !== 'builtin') {
    return `() => React.createElement(${decodeImportRequireWithAutoDynamic(
      encodeImportRequire(pTransformer.component),
      `demos_${pTransformer.type}`,
    )}, ${JSON.stringify(rendererProps)}, [])`;
  }

  // export external demo directly
  return node.properties.filePath
    ? encodeImportRequire(node.properties.filePath)
    : demoTransformer(node.properties.source, {
        isTSX: /^tsx?$/.test(node.properties.lang),
        fileAbsPath: node.properties.filePath || mdAbsPath,
      }).content;
}

/**
 * transform meta data for node
 * @param meta  node meta data from attribute & frontmatter
 */
function transformNodeMeta(meta: Record<string, any>) {
  Object.keys(meta).forEach(key => {
    const matched = key.match(/^desc(?:(\.[\w-]+$)|$)/);

    // compatible with short-hand usage for description field in previous dumi versions
    if (matched) {
      key = `description${matched[1] || ''}`;
      meta[key] = meta[matched[0]];
      delete meta[matched[0]];
    }

    // transform markdown for description field
    if (/^description(\.|$)/.test(key)) {
      meta[key] = transformer.markdown(meta[key], null, {
        type: 'html',
      }).content;
    }
  });

  return meta;
}

/**
 * apply code block detecting event
 * @param props         previewer props
 * @param dependencies  block example asset value
 * @param componentName the name of related component
 */
function applyCodeBlock(
  props: IPreviewerTransformerResult['rendererProps'],
  dependencies: ExampleBlockAsset['dependencies'],
  componentName: string,
) {
  ctx.umi?.applyPlugins({
    key: 'dumi.detectCodeBlock',
    type: ctx.umi.ApplyPluginsType.event,
    args: {
      type: 'BLOCK',
      name: props.title,
      description: props.description,
      thumbnail: props.thumbnail,
      tags: props.tags,
      previewUrl: props.previewUrl,
      atomAssetId: componentName,
      identifier: props.identifier || props.uuid,
      // for HiTu DSM, deprecated
      uuid: props.uuid,
      dependencies,
    },
  });
}

/**
 * apply demo detecting event
 * @param props previewer props
 */
function applyDemo(props: IPreviewerTransformerResult['previewerProps'], code: string) {
  // hoist previewerProps.sources to reduce .dumi/demos size
  Object.values(props.sources).forEach(file => {
    if (file.path) {
      file.content = file.content || encodeHoistImport(file.path);
      delete file.path;
    }
  });

  ctx.umi?.applyPlugins({
    key: 'dumi.detectDemo',
    type: ctx.umi.ApplyPluginsType.event,
    args: {
      uuid: props.identifier,
      code,
      previewerProps: props,
    },
  });
}

/**
 * watch dependent files watch for external demos, to update demo meta data
 * @param node          demo node
 * @param pTransformer  currying previewer transformer
 * @param cTransformer  currying code transformer
 * @param files         dependent files
 */
function listenExtDemoDepsChange(
  node: IDumiElmNode,
  pTransformer: ICurryingPreviewerTransformer,
  cTransformer: ICurryingCodeTransformer,
  files: string[],
) {
  let isUpdated = false;
  const listener = () => {
    if (!isUpdated) {
      isUpdated = true;
      debug(`regenerate demo props for: ${node.properties.filePath}`);

      // update source property
      node.properties.source = fs.readFileSync(node.properties.filePath, 'utf-8').toString();

      const { previewerProps, rendererProps } = pTransformer.fn();

      try {
        applyDemo(previewerProps, cTransformer(rendererProps));
      } catch (e) {
        /* nothing */
      }

      // continue to listen the next turn
      listenExtDemoDepsChange(
        node,
        pTransformer,
        cTransformer,
        getDependentFiles(previewerProps, node.properties.filePath),
      );
    }
  };

  // watch dependent files change
  files
    .concat(node.properties.filePath)
    .filter(fs.existsSync)
    .forEach(file => listenFileOnceChange(file, listener));
}

const visitor: Visitor<IDumiElmNode> = function visitor(node, i, parent) {
  if (node.tagName === 'div' && node.properties?.type === 'previewer') {
    node.properties.meta = node.properties.meta || {};

    // discard debug demo in production
    if (
      // only for production
      ctx.umi?.env === 'production' &&
      // read debug flag from frontmatter(inline demo) or attributes(external demo)
      (node.properties.meta.debug ||
        // read debug flag from external demo frontmatter
        (node.properties.filePath &&
          transformer.code(fs.readFileSync(node.properties.filePath, 'utf8').toString()).meta
            .debug))
    ) {
      parent.children.splice(i, 1);
    } else {
      // transform node to Previewer meta
      let rendererProps: IPreviewerTransformerResult['rendererProps'];
      let previewerProps: IPreviewerTransformerResult['previewerProps'];
      let demoDeps: ExampleBlockAsset['dependencies'];
      let previewerTransformer: ICurryingPreviewerTransformer;

      // execute transformers to get the first valid result, and save currying transformer
      previewerTransforms.some(item => {
        const caller = () =>
          item.fn({
            attrs: { src: node.properties.src, ...node.properties.meta },
            mdAbsPath: this.data('fileAbsPath'),
            node,
          });
        const result = caller();

        // get result from transformer
        if (result) {
          // generate demo id
          const identifier = getPreviewerId(
            node.properties.meta,
            this.data('fileAbsPath'),
            node.properties.filePath || this.data('fileAbsPath'),
          );
          // fill fields for tranformer result
          const decorateResult = (o: IPreviewerTransformerResult) => {
            // extra meta for external demo
            if (node.properties.filePath) {
              const { meta } = transformer.code(node.properties.source);

              // save original attr meta on code tag, to avoid node meta override frontmatter in HMR
              node.properties._ATTR_META = node.properties._ATTR_META || node.properties.meta;
              node.properties.meta = Object.assign(meta, node.properties._ATTR_META);
            }

            // transform node meta data
            node.properties.meta = transformNodeMeta(node.properties.meta);

            // set componentName for previewer props
            o.previewerProps.componentName = this.vFile.data.componentName;

            // assign node meta to previewer props (allow user override props via frontmatter or attribute)
            Object.assign(o.previewerProps, node.properties.meta);

            // force override id for previewer props
            o.previewerProps.identifier = identifier;

            // fallback dependencies & sources
            o.previewerProps.dependencies = o.previewerProps.dependencies || {};
            o.previewerProps.sources = o.previewerProps.sources || {};

            // generate demo dependencies from previewerProps.sources
            demoDeps = getDemoDeps(o.previewerProps, node.properties.lang);

            return o;
          };

          // export result
          ({ rendererProps = {}, previewerProps } = decorateResult(result));

          // save transformer
          previewerTransformer = {
            ...item,
            fn: () => decorateResult(caller()),
          };
        }

        // use the first valid result
        return result;
      });

      // generate demo code
      const codeTransformer: ICurryingCodeTransformer = props =>
        transformCode(node, this.data('fileAbsPath'), previewerTransformer, props);
      const code = codeTransformer(rendererProps);

      // declare demo on the top page component for memo
      const demoComponentCode = previewerProps.inline
        ? // insert directly for inline demo
          `React.memo(${decodeImportRequireWithAutoDynamic(code, 'demos_md_inline')})`
        : // render other demo from the common demo module: @@/dumi/demos
          `React.memo(DUMI_ALL_DEMOS['${previewerProps.identifier}'].component)`;

      this.vFile.data.demos = (this.vFile.data.demos || []).concat(
        `const ${DEMO_COMPONENT_NAME}${
          (this.vFile.data.demos?.length || 0) + 1
        } = ${demoComponentCode};`,
      );

      if (previewerProps.inline) {
        // append demo component directly for inline demo and other transformer result
        parent.children[i] = {
          previewer: true,
          type: 'element',
          tagName: `${DEMO_COMPONENT_NAME}${this.vFile.data.demos.length}`,
        };
      } else {
        parent.children[i] = {
          previewer: true,
          type: 'element',
          tagName: 'Previewer',
          // TODO: read props from common @@/dumi/demos module to reduce bundle size
          properties: {
            'data-previewer-props-replaced': previewerProps.identifier,
          },
          children: [
            {
              type: 'element',
              tagName: `${DEMO_COMPONENT_NAME}${this.vFile.data.demos.length}`,
              properties: {},
            },
          ],
        };
      }

      // collect demo meta data, exclude inline demo
      if (!previewerProps.inline) {
        // watch depend files to update demo meta for external demo
        if (node.properties.filePath) {
          listenExtDemoDepsChange(
            node,
            previewerTransformer,
            codeTransformer,
            getDependentFiles(previewerProps, node.properties.filePath),
          );
        }

        // apply umi plugins
        applyCodeBlock(previewerProps, demoDeps, this.vFile.data.componentName);
        applyDemo(previewerProps, code);
      }
    }
  }
};

export type { IPreviewerTransformer };

/**
 * register custom previewer transformer
 * @note    will be execute before builtin transformer
 * @param t transformer
 */
export function registerPreviewerTransformer(t: IPreviewerTransformer) {
  /* istanbul ignore else */
  if (previewerTransforms.every(item => item.type !== t.type)) {
    previewerTransforms.unshift(t);
  } else {
    ctx.umi?.logger.error(
      `[dumi]: same previewer transformer [${t.type}] cannot be registered twice.`,
    );
  }
}

export default function previewer(): IDumiUnifiedTransformer {
  return (ast: Node, vFile) => {
    // record code block id
    if (this.data('fileAbsPath')) {
      const mapObj = mdCodeBlockIdMap.get(this.data('fileAbsPath'));

      if(!mapObj) {
        // initialize map
        const prefix =
          vFile.data.componentName ||
          path.basename(slash(this.data('fileAbsPath')).replace(/(?:\/(?:index|readme))?(\.[\w-]+)?\.md/i, '$1'));

        mdCodeBlockIdMap.set(this.data('fileAbsPath'), {
          // save builtin-rule id
          id: prefix,
          // save conflict count
          count: Array.from(mdCodeBlockIdMap.values()).filter(m => m.id === prefix).length,
          // create code block id map
          map: new Map(),
        });
      } else {
        // clear single paths for a new transform flow
        mapObj.map = new Map();
      }
    }

    visit(ast, 'element', visitor.bind({ vFile, data: this.data }));
  };
}
