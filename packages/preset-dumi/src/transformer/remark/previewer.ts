import fs from 'fs';
import { Node } from 'unist';
import visit from 'unist-util-visit';
import toHtml from 'hast-util-to-html';
import demoTransformer, { DEMO_COMPONENT_NAME } from '../demo';
import transformer from '../index';

function visitor(node, i, parent) {
  if (node.tagName === 'div' && node.properties?.type === 'previewer') {
    const raw = node.children?.[0]?.value;
    const jsx = (node.children?.[1] && toHtml(node.children?.[1])) || undefined;
    const tsx = (node.children?.[2] && toHtml(node.children?.[2])) || undefined;
    const yaml = node.properties?.meta || {};
    let transformCode = raw;
    let dependencies;

    // transform markdown for previewer desc field
    Object.keys(yaml).forEach(key => {
      if (/^desc(\.|$)/.test(key)) {
        yaml[key] = transformer.markdown(yaml[key]).html;
      }
    });

    // use import way rather than source code way for external demo (for HMR & sourcemap)
    if (node.properties.filePath) {
      transformCode = `
import React, { useEffect } from 'react';
import Demo from '${node.properties.filePath}';

export default () => <Demo />;`;

      // collect deps from source code if it is external demo
      const transformResult = demoTransformer(
        fs.readFileSync(node.properties.filePath).toString(),
        { isTSX: Boolean(tsx), fileAbsPath: this.data('fileAbsPath') },
      );

      dependencies = transformResult.dependencies;
    }

    // transform demo source code
    const { content: code, ...demoTransformResult } = demoTransformer(transformCode, {
      isTSX: Boolean(tsx),
      fileAbsPath: this.data('fileAbsPath'),
    });

    // fallback to demo code dependencies
    dependencies = dependencies || demoTransformResult.dependencies;

    // save code into data then declare them on the top page component
    this.vFile.data.demos = (this.vFile.data.demos || []).concat(
      `const ${DEMO_COMPONENT_NAME}${(this.vFile.data.demos?.length || 0) +
        1} = React.memo(${code});`,
    );

    // replace original node
    parent.children[i] = {
      previewer: true,
      type: 'raw',
      value: `
<DumiPreviewer
  source={${JSON.stringify({ raw, jsx, tsx })}}
  {...${JSON.stringify({ ...yaml, dependencies })}}
>
  <${DEMO_COMPONENT_NAME}${this.vFile.data.demos.length} />
</DumiPreviewer>`,
    };
  }
}

export default function previewer() {
  return (ast: Node, vFile) => {
    visit(ast, 'element', visitor.bind({ vFile, data: this.data }));
  };
}
