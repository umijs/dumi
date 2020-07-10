import { Node } from 'unist';
import visit from 'unist-util-visit';
import ctx from '../../context';
import demoTransformer, { DEMO_COMPONENT_NAME, getDepsForDemo } from '../demo';
import transformer from '..';

function visitor(node, i, parent: Node) {
  if (node.tagName === 'div' && node.properties?.type === 'previewer') {
    const source = node.properties?.source || {};
    const yaml = node.properties?.meta || {};
    const raw = source.tsx || source.jsx;
    const demoOpts = {
      isTSX: Boolean(source.tsx),
      fileAbsPath:
        // for external demo
        node.properties.filePath ||
        // for embed demo
        this.data('fileAbsPath'),
    };
    let transformCode = raw;

    // transform markdown for previewer desc field
    Object.keys(yaml).forEach(key => {
      if (/^desc(\.|$)/.test(key)) {
        yaml[key] = transformer.markdown(yaml[key], null, { type: 'html' }).content;
      }
    });

    // use import way rather than source code way for external demo (for HMR & sourcemap)
    if (node.properties.filePath) {
      transformCode = `
import React from 'react';
import Demo from '${node.properties.filePath}';

export default () => <Demo />;`;
    }

    // transform demo source code
    const { content: code } = demoTransformer(transformCode, demoOpts);
    // use raw to ignore babel runtime deps
    const { dependencies, files } = getDepsForDemo(raw, demoOpts);

    // apply for assets command
    if (ctx.umi?.applyPlugins && !yaml.inline) {
      ctx.umi.applyPlugins({
        key: 'dumi.detectCodeBlock',
        type: ctx.umi.ApplyPluginsType.event,
        args: {
          type: 'BLOCK',
          name: yaml.title,
          description: yaml.desc,
          thumbnail: yaml.thumbnail,
          tags: yaml.tags,
          dependencies: {
            // append npm dependencies
            ...Object.entries(dependencies).reduce(
              (deps, [pkg, version]) =>
                Object.assign(deps, {
                  [pkg]: {
                    type: 'NPM',
                    // FIXME: get real version rule from package.json
                    value: `^${version}`,
                  },
                }),
              {},
            ),
            // append local file dependencies
            ...Object.entries({
              ...files,
              [`index.${demoOpts.isTSX ? 'tsx' : 'jsx'}`]: {
                content: raw,
              },
            }).reduce(
              (result, [file, { content }]) =>
                Object.assign(result, {
                  [file]: {
                    type: 'FILE',
                    value: content,
                  },
                }),
              {},
            ),
          },
        },
      });
    }

    // save code into data then declare them on the top page component
    this.vFile.data.demos = (this.vFile.data.demos || []).concat(
      `const ${DEMO_COMPONENT_NAME}${(this.vFile.data.demos?.length || 0) +
        1} = React.memo(${code});`,
    );

    // replace original node
    parent.children[i] = {
      previewer: true,
      type: 'element',
      tagName: 'DumiPreviewer',
      properties: {
        source,
        files,
        dependencies,
        ...yaml,
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

export default function previewer() {
  return (ast: Node, vFile) => {
    visit(ast, 'element', visitor.bind({ vFile, data: this.data }));
  };
}
