import { Node } from 'unist';
import visit from 'unist-util-visit';
import toHtml from 'hast-util-to-html';
import transformer, { DEMO_COMPONENT_NAME } from '../demo';

function visitor(node, i, parent) {
  if (node.tagName === 'div' && node.properties?.type === 'previewer') {
    const raw = node.children?.[0]?.value;
    const jsx = (node.children?.[1] && toHtml(node.children?.[1])) || undefined;
    const tsx = (node.children?.[2] && toHtml(node.children?.[2])) || undefined;
    const code = transformer(raw, node.properties.basePath || this.data('fileAbsDir'), Boolean(tsx));
    const yaml = node.properties?.meta?.frontmatter || {};

    // replace original node
    parent.children[i] = {
      type: 'raw',
      value: `
{(() => {
  ${code}

  return (
    <FatherDocPreviewer
      source={${JSON.stringify({ jsx, tsx })}}
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
    visit(ast, 'element', visitor.bind(this));
  }
}
