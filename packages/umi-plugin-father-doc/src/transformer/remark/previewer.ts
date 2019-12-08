import { Node } from 'unist';
import visit from 'unist-util-visit';
import toHtml from 'hast-util-to-html';
import transformer, { DEMO_COMPONENT_NAME } from '../demo';

function visitor(node, i, parent) {
  if (node.tagName === 'div' && node.properties?.type === 'previewer') {
    const raw = node.children?.[0]?.value;
    const jsx = (node.children?.[1] && toHtml(node.children?.[1])) || undefined;
    const tsx = (node.children?.[2] && toHtml(node.children?.[2])) || undefined;
    const yaml = node.properties?.meta || {};
    let transformCode = raw;

    // use import way rather than source code way for external demo (for HMR & sourcemap)
    if (node.properties.filePath) {
      transformCode = `
import Demo from '${node.properties.filePath}';
export default () => <Demo />;`
    }

    const code = transformer(transformCode, Boolean(tsx));

    // replace original node
    parent.children[i] = {
      previewer: true,
      type: 'raw',
      value: `
{(() => {
  ${code}

  return (
    <FatherDocPreviewer
      source={${JSON.stringify({ raw, jsx, tsx })}}
      {...${JSON.stringify(yaml)}}
    >
      <${DEMO_COMPONENT_NAME} />
    </FatherDocPreviewer>
  );
})()}`,
    };
  }
}

export default function previewer() {
  return (ast: Node) => {
    visit(ast, 'element', visitor);
  }
}
