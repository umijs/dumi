import type { Root } from 'mdast';
import type { Transformer } from 'unified';

let visit: typeof import('unist-util-visit').visit;
let SKIP: typeof import('unist-util-visit').SKIP;

const VALID_CONTAINER_TYPES = [
  'info',
  'warning',
  'success',
  'error',
  'code-group',
];

// workaround to import pure esm module
(async () => {
  ({ visit, SKIP } = await import('unist-util-visit'));
})();

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
      if (
        node.type === 'containerDirective' &&
        VALID_CONTAINER_TYPES.includes(node.name)
      ) {
        switch (node.name) {
          case 'code-group': {
            // replace directive node with container node
            parent!.children.splice(i!, 1, {
              type: 'code',
              lang: 'jsx',
              value: `
                /**\n
                 * inline: true\n
                 */\n
                import Tabs from 'rc-tabs';\n
                import SourceCode from 'dumi/theme/builtins/SourceCode';\n       
                const nodeChildren = ${JSON.stringify(node.children)}         
                export default () => (
                  <Tabs
                    prefixCls="dumi-default-tabs"
                    defaultActiveKey="1"
                    items={nodeChildren.map((item,index) => ({
                      label:item.meta,
                      key:index,
                      children: <SourceCode lang={item.lang} >{item.value}</SourceCode>
                    }))}
                  />
                );`,
              position: node.position,
            });
            break;
          }
          default: {
            const attrs = Object.entries(node.attributes || {}).reduce<string>(
              (ret, [name, value]) =>
                `${ret} ${value ? `${name}="${value}"` : name}`,
              '',
            );

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
          }
        }
        return SKIP;
      }
    });
  };
}
