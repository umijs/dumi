import { Node } from 'unist';
import visit, { Visitor } from 'unist-util-visit';
import slash from 'slash2';
import ctx from '../../context';
import demoTransformer, { DEMO_COMPONENT_NAME, getDepsForDemo } from '../demo';
import { IPreviewerComponentProps } from '../../theme';
import transformer from '..';
import { IDumiElmNode, IDumiUnifiedTransformer } from '.';

const demoIds: Object = {};

/**
 * get unique id for previewer
 * @param yaml          meta data
 * @param mdAbsPath     md absolute path
 * @param codeAbsPath   code absolute path, it is seem as mdAbsPath for embed demo
 * @param componentName the name of related component
 */
function getPreviewerId(yaml: any, mdAbsPath: string, codeAbsPath: string, componentName: string) {
  const ids = demoIds[mdAbsPath];
  let id = yaml.identifier || yaml.uuid;

  // do not generate identifier for inline demo
  if (yaml.inline) {
    return;
  }

  if (!id) {
    const words = (slash(codeAbsPath) as string)
      // discard index & suffix like index.tsx
      .replace(/(?:\/index)?(\.[\w-]+)?\.\w+$/, '$1')
      .split(/\//)
      .map(w => w.toLowerCase());

    // /path/to/index.tsx -> to || /path/to.tsx -> to
    const demoName = words[words.length - 1] || 'demo';
    const prefix =
      componentName ||
      words
        .slice(0, words.length - 1)
        .filter(word => word && !['src', 'demo', 'demos'].includes(word))
        .slice(-1)[0];

    id = [prefix, demoName].join('-');
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
function transformNode(node: IDumiElmNode, fileAbsPath: string) {
  const props = node.properties;
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
      previewUrl: props.previewUrl || props.previewurl,
      atomAssetId: componentName,
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

const visitor: Visitor<IDumiElmNode> = function visitor(node, i, parent) {
  if (node.tagName === 'div' && node.properties?.type === 'previewer') {
    const source = node.properties.source;
    const yaml = node.properties.meta || {};
    const fileAbsPath =
      // for external demo
      node.properties.filePath ||
      // for embed demo
      this.data('fileAbsPath');

    Object.keys(yaml).forEach(oKey => {
      // workaround for JSX prop name not allowed to contains .
      // refer: https://github.com/facebook/jsx/issues/42
      let key = oKey.replace(/\./g, '_');
      const matched = key.match(/^desc(?:(_[\w-]+$)|$)/);

      // compatible with short-hand usage for description field in previous dumi versions
      if (matched) {
        key = `description${matched[1] || ''}`;
      }

      // replace props key name
      if (key !== oKey) {
        yaml[key] = yaml[oKey];
        delete yaml[oKey];
      }

      // transform markdown for description field
      if (/^description(_|$)/.test(key)) {
        // use wrapper object for workaround to avoid escape \n
        // eslint-disable-next-line
        yaml[key] = new String(
          JSON.stringify(
            transformer.markdown(yaml[key], null, {
              type: 'html',
            }).content,
          ),
        );
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
      componentName: this.vFile.data.componentName,
      ...yaml,
      // to avoid user's identifier override internal logic
      identifier: getPreviewerId(
        yaml,
        this.data('fileAbsPath'),
        fileAbsPath,
        this.vFile.data.componentName,
      ),
    };

    // declare demo on the top page component for memo
    const demoComponentCode = yaml.inline
      ? // insert directly for inline demo
        `React.memo(${code})`
      : // render other demo from the common demo module: @@/dumi/demos
        `require('@@/dumi/demos').default['${previewerProps.identifier}'].component`;

    this.vFile.data.demos = (this.vFile.data.demos || []).concat(
      `const ${DEMO_COMPONENT_NAME}${(this.vFile.data.demos?.length || 0) +
        1} = ${demoComponentCode};`,
    );

    // replace original node
    if (ctx.umi?.env === 'production' && yaml.debug) {
      // discard debug demo in production
      parent.children.splice(i, 1);
      this.vFile.data.demos.splice(this.vFile.data.demos.length - 1, 1);
    } else if (yaml.inline) {
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
};

export default function previewer(): IDumiUnifiedTransformer {
  // clear single paths for a new transform flow
  if (this.data('fileAbsPath')) {
    demoIds[this.data('fileAbsPath')] = {};
  }

  return (ast: Node, vFile) => {
    visit(ast, 'element', visitor.bind({ vFile, data: this.data }));
  };
}
