import slugger from 'github-slugger';
import visit from 'unist-util-visit';
import toString from 'hast-util-to-string';
import is from 'hast-util-is-element';
import has from 'hast-util-has-property';
import { IDumiUnifiedTransformer, IDumiElmNode } from '.';

const slugs = slugger();
const headings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

function filterValidChildren(children: IDumiElmNode[]) {
  return children.filter(item => {
    return item.type !== 'element' || !/^[A-Z]/.test(item.tagName);
  });
}

/**
 * rehype plugin for collect slugs & add id for headings
 */
export default (): IDumiUnifiedTransformer => (ast, vFile) => {
  // initial slugs & reset slugger
  slugs.reset();
  vFile.data.slugs = [];

  visit<IDumiElmNode>(ast, 'element', node => {
    // visit all heading element
    if (is(node, headings)) {
      const title = toString({
        children: filterValidChildren(node.children),
        value: node.value,
      });

      // generate id if not exist
      if (!has(node, 'id')) {
        node.properties.id = slugs.slug(title);
      }

      // save slugs
      vFile.data.slugs.push({
        depth: parseInt(node.tagName[1], 10),
        value: title,
        heading: node.properties.id,
      });

      // use first title as page title if not exist
      if (!vFile.data.title) {
        vFile.data.title = title;
      }
    }
  });
};
