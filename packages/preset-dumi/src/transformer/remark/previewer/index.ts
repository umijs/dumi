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
import { encodeImportRequire, decodeImportRequireWithAutoDynamic } from '../../utils';
import builtinTransformer from './builtin';
import { listenFileOnceChange } from '../../../utils/watcher';
import type { IDumiElmNode, IDumiUnifiedTransformer } from '..';
import type { IPreviewerTransformer } from './builtin';

interface ICurryingPreviewerTransformer extends IPreviewerTransformer {
  fn: () => ReturnType<IPreviewerTransformer['fn']>;
}

type ICurryingCodeTransformer = (props: ReturnType<IPreviewerTransformer['fn']>['props']) => string;

const debug = createDebug('dumi:previewer');
const previewerTransforms: IPreviewerTransformer[] = [builtinTransformer];

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
const mdCodeBlockIdMap = new Map<string, Map<string, number>>();

/**
 * get unique id for previewer
 * @param yaml          meta data
 * @param mdAbsPath     md absolute path
 * @param codeAbsPath   code absolute path, it is seem as mdAbsPath for embed demo
 * @param componentName the name of related component
 */
function getPreviewerId(yaml: any, mdAbsPath: string, codeAbsPath: string, componentName: string) {
  let id: string = yaml.identifier || yaml.uuid;

  // do not generate identifier for inline demo
  if (yaml.inline) {
    return;
  }

  if (!id) {
    if (mdAbsPath === codeAbsPath) {
      // for code block demo, format: component-demo-N
      const idMap = mdCodeBlockIdMap.get(mdAbsPath);
      const prefix =
        componentName ||
        path.basename(slash(mdAbsPath).replace(/(?:\/(?:index|readme))?(\.[\w-]+)?\.md/i, '$1'));

      id = `${prefix}-demo`;

      // record id count
      const currentIdCount = idMap.get(id) || 0;

      idMap.set(id, currentIdCount + 1);

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
 * transform demo node to real component
 * @param node          demo node
 * @param mdAbsPath     md absolute path
 * @param pTransformer  previewer transformer
 * @param props         previewer props
 */
function transformCode(
  node: IDumiElmNode,
  mdAbsPath: string,
  pTransformer: ICurryingPreviewerTransformer,
  props: ReturnType<IPreviewerTransformer['fn']>['props'],
) {
  // export third-party transformer directly
  if (pTransformer.type !== 'builtin') {
    return `() => React.createElement(${decodeImportRequireWithAutoDynamic(
      encodeImportRequire(pTransformer.component),
      `demos_${pTransformer.type}`,
    )}, ${JSON.stringify(props)}, [])`;
  }

  // export external demo directly
  return node.properties.filePath
    ? encodeImportRequire(node.properties.filePath)
    : demoTransformer(node.properties.source.tsx || node.properties.source.jsx, {
        isTSX: Boolean(node.properties.source.tsx),
        fileAbsPath: node.properties.filePath || mdAbsPath,
      }).content;
}

/**
 * apply code block detecting event
 * @param props         previewer props
 * @param dependencies  block example asset value
 * @param componentName the name of related component
 */
function applyCodeBlock(
  props: ReturnType<IPreviewerTransformer['fn']>['props'],
  dependencies: ReturnType<IPreviewerTransformer['fn']>['dependencies'],
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
function applyDemo(props: ReturnType<IPreviewerTransformer['fn']>['props'], code: string) {
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
  files: ReturnType<IPreviewerTransformer['fn']>['dependentFiles'],
) {
  let isUpdated = false;
  const listener = () => {
    if (!isUpdated) {
      isUpdated = true;
      debug(`regenerate demo props for: ${node.properties.filePath}`);

      const { props, dependentFiles } = pTransformer.fn();

      applyDemo(props, cTransformer(props));

      // continue to listen the next turn
      listenExtDemoDepsChange(node, pTransformer, cTransformer, dependentFiles);
    }
  };

  // watch dependent files change
  files.concat(node.properties.filePath).forEach(file => listenFileOnceChange(file, listener));
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
      let previewerProps: ReturnType<IPreviewerTransformer['fn']>['props'];
      let demoDeps: ReturnType<IPreviewerTransformer['fn']>['dependencies'];
      let dependentFiles: ReturnType<IPreviewerTransformer['fn']>['dependentFiles'];
      let previewerTransformer: ICurryingPreviewerTransformer;

      // execute transformers to get the first valid result, and save currying transformer
      previewerTransforms.some(item => {
        const caller = () =>
          item.fn({
            attrs: node.properties.meta,
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
            this.vFile.data.componentName,
          );
          // fill fields for tranformer result
          const decorateResult = (o: ReturnType<IPreviewerTransformer['fn']>) => {
            // set componentName for previewer props
            o.props.componentName = this.vFile.data.componentName;

            // assign node meta to previewer props (allow user override props via frontmatter or attribute)
            Object.assign(o.props, node.properties.meta);

            // force override id for previewer props
            o.props.identifier = identifier;

            return o;
          };

          // export result
          ({
            props: previewerProps,
            dependencies: demoDeps,
            dependentFiles = [],
          } = decorateResult(result));

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
      const isBuiltinTransformer = previewerTransformer.type === 'builtin';
      const codeTransformer: ICurryingCodeTransformer = props =>
        transformCode(node, this.data('fileAbsPath'), previewerTransformer, props);
      const code = codeTransformer(previewerProps);

      // declare demo on the top page component for memo
      const demoComponentCode =
        previewerProps.inline
          ? // insert directly for inline demo
            `React.memo(${decodeImportRequireWithAutoDynamic(code, 'demos_md_inline')})`
          : // render other demo from the common demo module: @@/dumi/demos
            `React.memo(DUMI_ALL_DEMOS['${previewerProps.identifier}'].component)`;

      this.vFile.data.demos = (this.vFile.data.demos || []).concat(
        `const ${DEMO_COMPONENT_NAME}${
          (this.vFile.data.demos?.length || 0) + 1
        } = ${demoComponentCode};`,
      );

      if (previewerProps.inline || !isBuiltinTransformer) {
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
        // apply umi plugins
        applyCodeBlock(previewerProps, demoDeps, this.vFile.data.componentName);
        applyDemo(previewerProps, code);

        // watch depend files to update demo meta for external demo
        if (node.properties.filePath) {
          listenExtDemoDepsChange(node, previewerTransformer, codeTransformer, dependentFiles);
        }
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
  if (previewerTransforms.every(item => item.type !== t.type)) {
    previewerTransforms.unshift(t);
  } else {
    ctx.umi?.logger.error(
      `[dumi]: same previewer transformer [${t.type}] cannot be registered twice.`,
    );
  }
}

export default function previewer(): IDumiUnifiedTransformer {
  // clear single paths for a new transform flow
  if (this.data('fileAbsPath')) {
    mdCodeBlockIdMap.set(this.data('fileAbsPath'), new Map());
  }

  return (ast: Node, vFile) => {
    visit(ast, 'element', visitor.bind({ vFile, data: this.data }));
  };
}
