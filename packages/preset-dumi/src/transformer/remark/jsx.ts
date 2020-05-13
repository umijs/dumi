import { Node } from 'unist';
import visit from 'unist-util-visit';
import visitParents from 'unist-util-visit-parents';

const SINGLE_TAGS_EXPS = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
].map(tag => new RegExp(`<(${tag}[^>]*?)>`, 'g'));

const textVisitor = node => {
  // escape { & } for JSX
  // TODO: find a better way to avoid multi-times escape
  if (!/'[{}]+'/.test(node.value)) {
    node.value = node.value.replace(/([{}]+)/g, "{'$1'}");
  }
};

const rawVisitor = (node, i, parent) => {
  const PRE_EXP = /^<pre>([^]+)<\/pre>$/;
  const COMMENT_EXP = /^\s*<!--[^]+-->\s*$/;

  // convert \n to <br> in code block for pre tag
  if (PRE_EXP.test(node.value)) {
    const content = node.value
      .match(PRE_EXP)[1]
      .replace(/^\n|\n$/g, '')
      .replace(/\n/g, '<br />');

    node.value = `<pre>${content}</pre>`;
  }

  // remove HTML comments for JSX
  if (COMMENT_EXP.test(node.value)) {
    parent.children.splice(i, 1);
  }

  // convert all self-closing HTML tag
  // see also: https://github.com/umijs/umi/blob/master/packages/umi-build-dev/src/htmlToJSX.js#L118
  if (!node.previewer) {
    SINGLE_TAGS_EXPS.forEach(regex => {
      node.value = node.value.replace(regex, (_, str) => {
        if (str.endsWith('/')) {
          return `<${str}>`;
        }
        return `<${str} />`;
      });
    });
  }
};

export default () => (ast: Node) => {
  visitParents(ast, 'text', textVisitor);
  visit(ast, 'raw', rawVisitor);
};
