import { Node } from 'unist';
import visit from 'unist-util-visit';
import slash from 'slash2';
import ctx from '../../context';
import demoTransformer, { DEMO_COMPONENT_NAME, getDepsForDemo } from '../demo';
import { IPreviewerComponentProps } from '../../theme';
import transformer from '..';

let demoIds: Object = {};

/**
 * get unique id for previewer
 * @param yaml        meta data
 * @param fileAbsPath file absolute path
 */
function getPreviewerId(yaml: any, fileAbsPath: string) {
  const ids = demoIds[fileAbsPath];
  let id = yaml.identifier || yaml.uuid || yaml.componentName;

  if (!id) {
    // /path/to/md => path-to-md
    id = slash(fileAbsPath)
      // discard suffix like index.md
      .replace(/(\/index)?\.\w+$/, '')
      .split('/')
      // get the last three levels
      .slice(-2)
      .join('-');
  }

  // record id
  ids[id] = (ids[id] || 0) + 1;

  // handle conflict ids
  return ids[id] > 1 ? `${id}-${ids[id] - 1}` : id;
}

/**
 * transform previewer node to code, dependent fies & dependencies
 * @param node        previewer node
 * @param fileAbsPath demo absolute path
 */
function transformNode(node: Node, fileAbsPath: string) {
  const props = node.properties as any;
  const code = props.source.tsx || props.source.jsx;
  const isExternalDemo = props.filePath;
  const transformOpts = {
    isTSX: Boolean(props.source.tsx),
    fileAbsPath,
  };

  return {
    code: demoTransformer(
      // use import way for external demo use to HMR & sourcemap
      isExternalDemo
        ? `
import React from 'react';
import Demo from '${props.filePath}';

export default () => <Demo />;
`
        : code,
      transformOpts,
    ).content,
    ...getDepsForDemo(code, transformOpts),
  };
}

/**
 * apply code block detecting event
 * @param props previewer props
 */
function applyCodeBlock(props: IPreviewerComponentProps) {
  ctx.umi?.applyPlugins({
    key: 'dumi.detectCodeBlock',
    type: ctx.umi.ApplyPluginsType.event,
    args: {
      type: 'BLOCK',
      name: props.title,
      description: props.description,
      thumbnail: props.thumbnail,
      tags: props.tags,
      atomAssetId: props.componentName,
      // for HiTu DSM
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
                value: tsx || jsx || content,
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

function visitor(node, i, parent: Node) {
  if (node.tagName === 'div' && node.properties?.type === 'previewer') {
    const source = node.properties.source;
    const yaml = node.properties.meta || {};
    const fileAbsPath =
      // for external demo
      node.properties.filePath ||
      // for embed demo
      this.data('fileAbsPath');

    // transform markdown for previewer desc field
    Object.keys(yaml).forEach(key => {
      const matched = key.match(/^desc(\.|$)/);

      if (matched) {
        yaml[`description${matched[1]}`] = transformer.markdown(yaml[key], null, {
          type: 'html',
        }).content;
        delete yaml[key];
      }
    });

    // transform demo node
    const { code, dependencies, files } = transformNode(node, fileAbsPath);

    // create properties for Previewer
    const previewerProps: IPreviewerComponentProps & { [key: string]: any } = {
      sources: {
        _: source,
        ...Object.keys(files).reduce(
          (result, file) => ({
            ...result,
            [file]: {
              import: files[file].import,
              content: files[file].content,
              // TODO: convert tsx for files
            },
          }),
          {},
        ),
      },
      dependencies,
      ...yaml,
      // not allow user override identifier by frontmatter
      identifier: getPreviewerId(yaml, this.data('fileAbsPath')),
    };

    // apply umi plugins
    applyCodeBlock(previewerProps);
    applyDemo(previewerProps, code);

    // declare demo on the top page component for memo
    this.vFile.data.demos = (this.vFile.data.demos || []).concat(
      `const ${DEMO_COMPONENT_NAME}${(this.vFile.data.demos?.length || 0) +
        1} = require('@@/dumi/demos').default['${
        // render demo from the common demo module: @@/dumi/demos
        previewerProps.identifier
      }'].component;`,
    );

    // replace original node
    if (yaml.inline) {
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
        properties: previewerProps,
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
}

export default function previewer() {
  // clear single paths for a new transform flow
  if (this.data('fileAbsPath')) {
    demoIds[this.data('fileAbsPath')] = {};
  }

  return (ast: Node, vFile) => {
    visit(ast, 'element', visitor.bind({ vFile, data: this.data }));
  };
}
