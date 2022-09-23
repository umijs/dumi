import yaml from 'js-yaml';
import type { Root } from 'remark-frontmatter';
import type { Transformer } from 'unified';

let visit: typeof import('unist-util-visit').visit;

// workaround to import pure esm module
(async () => {
  ({ visit } = await import('unist-util-visit'));
})();

export default function remarkMeta(): Transformer<Root> {
  return (tree, file) => {
    visit<Root, 'yaml'>(tree, 'yaml', (node) => {
      try {
        file.data.frontmatter = yaml.load(node.value) as any;
      } catch {}
    });
  };
}
