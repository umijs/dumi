import path from 'path';
import { Node } from 'unist';
import slugger from 'github-slugger';
import visit from 'unist-util-visit';
import has from 'hast-util-has-property';
import ctx from '../../context';
import demoTransformer, { DEMO_COMPONENT_NAME, getDepsForDemo, getCSSForDeps } from '../demo';
import transformer from '..';

const slugs = slugger();
let demoSinglePaths: Object = {};

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
    const CSSInDeps = getCSSForDeps(dependencies);

    // save css in dependencies, such as antd.css
    if (CSSInDeps.length) {
      yaml['css-in-dependencies'] = CSSInDeps;
    }

    if (ctx.umi?.applyPlugins && !yaml.inline) {
      // apply for assets command
      ctx.umi.applyPlugins({
        key: 'dumi.detectCodeBlock',
        type: ctx.umi.ApplyPluginsType.event,
        args: {
          type: 'BLOCK',
          name: yaml.title,
          description: yaml.desc,
          thumbnail: yaml.thumbnail,
          tags: yaml.tags,
          atomAssetId: this.vFile.data.componentName,
          // for HiTu DSM
          uuid: yaml.uuid,
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

      // apply for single-route demo feature
      const singlePaths = demoSinglePaths[this.data('fileAbsPath')];
      const singlePathId =
        yaml.path || yaml.uuid || yaml.componentName || path.parse(demoOpts.fileAbsPath).name;

      // rewrite demo path
      yaml.path = `${singlePathId}${
        singlePaths[singlePathId] ? `-${singlePaths[singlePathId]}` : ''
      }`;

      // record demo ids to avoid conflict
      singlePaths[singlePathId] = (singlePaths[singlePathId] || 0) + 1;

      // TODO: create unified demo renderer to reduce bundle size
      ctx.umi.applyPlugins({
        key: 'dumi.detectDemo',
        type: ctx.umi.ApplyPluginsType.event,
        args: {
          uuid: yaml.path,
          code,
          previewerProps: {
            ...yaml,
            source,
            dependencies,
            files,
          },
        },
      });
    }

    // save code into data then declare them on the top page component
    this.vFile.data.demos = (this.vFile.data.demos || []).concat(
      `const ${DEMO_COMPONENT_NAME}${(this.vFile.data.demos?.length || 0) +
        1} = React.memo(${code});`,
    );

    if (!has(node, 'id') && yaml.title) {
      (node.properties as any).id = slugs.slug(yaml.title);
    }

    // save demos which have title into slugs
    if (yaml.title) {
      this.vFile.data.slugs.push({
        depth: 5,
        value: yaml.title,
        heading: node.properties.id,
      });
    }

    // replace original node
    parent.children[i] = {
      previewer: true,
      type: 'element',
      tagName: 'DumiPreviewer',
      properties: {
        ...yaml,
        source,
        files,
        dependencies,
        id: node.properties.id,
        path: `~demos/${yaml.path}`,
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
  // clear single paths for a new transform flow
  if (this.data('fileAbsPath')) {
    demoSinglePaths[this.data('fileAbsPath')] = {};
  }

  return (ast: Node, vFile) => {
    slugs.reset();
    visit(ast, 'element', visitor.bind({ vFile, data: this.data }));
  };
}
