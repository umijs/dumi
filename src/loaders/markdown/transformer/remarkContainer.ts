import type { Root } from 'mdast';
import type { Transformer } from 'unified';
import { SKIP_DEMO_PARSE } from './rehypeDemo';

let visit: typeof import('unist-util-visit').visit;
let SKIP: typeof import('unist-util-visit').SKIP;
let CONTINUE: typeof import('unist-util-visit').CONTINUE;

const VALID_CONTAINER_TYPES = ['info', 'warning', 'success', 'error'];
const CODE_GROUP_SPECIFIER = 'code-group';

// workaround to import pure esm module
(async () => {
  ({ visit, SKIP, CONTINUE } = await import('unist-util-visit'));
})();

// transform attributes to string
const transformAttributes = (attributes?: Record<string, any> | null) =>
  Object.entries(attributes ?? {}).reduce<string>(
    (ret, [name, value]) => `${ret} ${value ? `${name}="${value}"` : name}`,
    '',
  );

export default function remarkContainer(this: any): Transformer<Root> {
  const data = this.data();
  const micromarkExtensions = data.micromarkExtensions.find(
    ({ flow, text }: any) => flow && '58' in flow && text && '58' in text,
  );

  // disable textDirective & leafDirective from remark-directive
  // to avoid conflict with real colon symbol in markdown content
  delete micromarkExtensions.text;
  micromarkExtensions.flow['58'].splice(1, 1);

  return (tree) => {
    visit<Root>(tree, (node, i, parent) => {
      if (node.type !== 'containerDirective') return CONTINUE;

      if (VALID_CONTAINER_TYPES.includes(node.name)) {
        const attrs = transformAttributes(node.attributes);
        // replace directive node with container node
        parent!.children.splice(
          i!,
          1,
          {
            type: 'html',
            value: `<Container type="${node.name}"${attrs}>`,
            position: node.position,
          },
          ...(node.children || []).concat({
            type: 'html',
            value: '</Container>',
          }),
        );

        return SKIP;
      }

      // code-group is a special container
      if (node.name === CODE_GROUP_SPECIFIER) {
        const codeChildren = node.children
          .filter(({ type }) => type === 'code')
          .map((child) => ({
            ...child,
            data: {
              ...child.data,
              //  dumi 默认会编译有关联技术栈的代码块, 标记为不需要编译
              [SKIP_DEMO_PARSE]: true,
            },
          }));

        parent!.children.splice(
          i!,
          1,
          {
            type: 'html',
            value: `<CodeGroup>`,
            position: node.position,
          },
          ...codeChildren,
          {
            type: 'html',
            value: '</CodeGroup>',
          },
        );

        return SKIP;
      }
    });
  };
}
