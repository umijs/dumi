import fs from 'fs';
import path from 'path';
import type { Node } from 'unist';
import type { Visitor } from 'unist-util-visit';
import visit from 'unist-util-visit';
import { createDebug } from '@umijs/utils';
import slash from 'slash2';
import ctx from '../../context';
import demoTransformer, { DEMO_COMPONENT_NAME, getDepsForDemo } from '../demo';
import type { IPreviewerComponentProps } from '../../theme';
import transformer from '..';
import type { IDumiElmNode, IDumiUnifiedTransformer } from '.';
import {
  encodeHoistImport,
  encodeImportRequire,
  decodeImportRequireWithAutoDynamic,
  decodeHoistImportToContent,
} from '../utils';

const debug = createDebug('dumi:previewer');

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
  let id = yaml.identifier || yaml.uuid;

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
 * transform demo node to real component
 * @param node        demo node
 * @param mdAbsPath   md absolute path
 */
function transformCode(node: IDumiElmNode, mdAbsPath: string) {
  // export external demo directly
  return node.properties.filePath
    ? encodeImportRequire(node.properties.filePath)
    : demoTransformer(node.properties.source.tsx || node.properties.source.jsx, {
        isTSX: Boolean(node.properties.source.tsx),
        fileAbsPath: node.properties.filePath || mdAbsPath,
      }).content;
}

/**
 * generate previewer props for demo node
 * @param node        demo node
 * @param mdAbsPath   markdown file absolute file
 * @param identifier  exist previewId, will generate a new one if not passed
 */
function generatePreviewerProps(
  node: IDumiElmNode,
  mdAbsPath: string,
  componentName: string,
  identifier?: string,
): IPreviewerComponentProps & Record<string, any> {
  const isExternalDemo = Boolean(node.properties.filePath);
  let fileAbsPath = mdAbsPath;

  // special process external demo
  if (isExternalDemo) {
    const lang = node.properties.filePath.match(/\.(\w+)$/)[1];
    const { meta, content } = transformer.code(
      fs.readFileSync(node.properties.filePath, 'utf8').toString(),
    );

    fileAbsPath = node.properties.filePath;
    node.properties.source = { [lang]: content };
    // save original attr meta on code tag, for HMR
    node.properties._ATTR_META = node.properties._ATTR_META || node.properties.meta;
    node.properties.meta = Object.assign(meta, node.properties._ATTR_META);
  }

  const yaml = transformNodeMeta(node.properties.meta || {});
  const previewId = identifier || getPreviewerId(yaml, mdAbsPath, fileAbsPath, componentName);
  const { files, dependencies } = getDepsForDemo(
    node.properties.source.tsx || node.properties.source.jsx,
    {
      isTSX: Boolean(node.properties.source.tsx),
      fileAbsPath,
      depChangeListener:
        !yaml.inline &&
        isExternalDemo &&
        (() => {
          debug(`regenerate demo props for: ${node.properties.filePath}`);
          // update @@/demos module if external demo changed, to update previewerProps for page component
          applyDemo(
            generatePreviewerProps(node, mdAbsPath, componentName, previewId),
            transformCode(node, mdAbsPath),
          );
        }),
    },
  );

  return {
    sources: {
      _: isExternalDemo
        ? Object.keys(node.properties.source).reduce(
            (r, lang) => ({
              ...r,
              [lang]: encodeHoistImport(node.properties.filePath),
            }),
            {},
          )
        : node.properties.source,
      ...Object.keys(files).reduce(
        (result, file) => ({
          ...result,
          [file]: {
            import: files[file].import,
            content: encodeHoistImport(files[file].fileAbsPath),
          },
        }),
        {},
      ),
    },
    dependencies,
    componentName,
    ...yaml,
    // to avoid user's identifier override internal logic
    identifier: previewId,
  };
}

/**
 * apply code block detecting event
 * @param props previewer props
 * @param componentName the name of related component
 */
function applyCodeBlock(props: IPreviewerComponentProps, componentName: string) {
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
      dependencies: {
        // append npm dependencies
        ...Object.entries(props.dependencies).reduce(
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
          (result, [file, { tsx, jsx, content }]) =>
            Object.assign(result, {
              // handle main file
              [file === '_' ? `index.${tsx ? 'tsx' : 'jsx'}` : file]: {
                type: 'FILE',
                value:
                  file === '_'
                    // strip frontmatter for main file
                    ? transformer.code(decodeHoistImportToContent(tsx || jsx)).content
                    : decodeHoistImportToContent(content),
              },
            }),
          {},
        ),
      },
    },
  });
}

/**
 * apply demo detecting event
 * @param props previewer props
 */
function applyDemo(props: IPreviewerComponentProps, code: string) {
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

const visitor: Visitor<IDumiElmNode> = function visitor(node, i, parent) {
  if (node.tagName === 'div' && node.properties?.type === 'previewer') {
    // generate previewer props
    const previewerProps = generatePreviewerProps(
      node,
      this.data('fileAbsPath'),
      this.vFile.data.componentName,
    );

    // generate demo node
    const code = transformCode(node, this.data('fileAbsPath'));

    // declare demo on the top page component for memo
    const demoComponentCode = previewerProps.inline
      ? // insert directly for inline demo
        `React.memo(${decodeImportRequireWithAutoDynamic(code, 'demos_md_inline')})`
      : // render other demo from the common demo module: @@/dumi/demos
        `React.memo(DUMI_ALL_DEMOS['${previewerProps.identifier}'].component)`;

    this.vFile.data.demos = (this.vFile.data.demos || []).concat(
      `const ${DEMO_COMPONENT_NAME}${(this.vFile.data.demos?.length || 0) +
        1} = ${demoComponentCode};`,
    );

    // replace original node
    if (ctx.umi?.env === 'production' && previewerProps.debug) {
      // discard debug demo in production
      parent.children.splice(i, 1);
      this.vFile.data.demos.splice(this.vFile.data.demos.length - 1, 1);
    } else if (previewerProps.inline) {
      parent.children[i] = {
        previewer: true,
        type: 'element',
        tagName: `${DEMO_COMPONENT_NAME}${this.vFile.data.demos.length}`,
      };
    } else {
      // apply umi plugins
      applyCodeBlock(previewerProps, this.vFile.data.componentName);
      applyDemo(previewerProps, code);

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
  }
};

export default function previewer(): IDumiUnifiedTransformer {
  // clear single paths for a new transform flow
  if (this.data('fileAbsPath')) {
    mdCodeBlockIdMap.set(this.data('fileAbsPath'), new Map());
  }

  return (ast: Node, vFile) => {
    visit(ast, 'element', visitor.bind({ vFile, data: this.data }));
  };
}
