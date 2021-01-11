import visit from 'unist-util-visit';
import has from 'hast-util-has-property';
import raw from 'hast-util-raw';
import type { IDumiUnifiedTransformer, IDumiElmNode } from '.';

/**
 * detect properties whether has complex value
 * @param props
 */
function hasComplexProp(props: Record<string, any>) {
  return Object.values(props).some(
    prop => ['object', 'function'].includes(typeof prop) || Array.isArray(prop),
  );
}

/**
 * rehype plugin for compile raw node to hast
 */
export default (): IDumiUnifiedTransformer => ast => {
  const props = [];

  visit(ast, node => {
    // workaround to avoid lowercase for React Component tag name
    // mark React Compnoent via dumi-raw prefixer, eg Alert => dumi-raw-alert
    if (typeof node.tagName === 'string' && /^[A-Z]/.test(node.tagName)) {
      node.tagName = `dumi-raw${node.tagName.replace(/[A-Z]/g, s => `-${s.toLowerCase()}`)}`;
    } else if (typeof node.value === 'string' && node.type === 'raw') {
      node.value = node.value.replace(/(<\/?)([A-Z]\w+)/g, (_, prefix, tagName) => {
        return `${prefix}dumi-raw${tagName.replace(/[A-Z]/g, s => `-${s.toLowerCase()}`)}`;
      });
    }

    // workaround to avoid parse React Component properties to string in the raw step
    if (typeof node.properties === 'object' && hasComplexProp(node.properties)) {
      props.push(node.properties);
      node.properties = {
        _index: props.length - 1,
      };
    }

    // special process <code />, <code > to <code></code>
    // to avoid non-self-closing exception in the raw step
    if (typeof node.value === 'string' && /<code[^>]*src=/.test(node.value)) {
      node.value = node.value.replace(/ ?\/?>/g, '></code>');
    }

    // special process <API /> for same reason in above
    if (typeof node.value === 'string' && /<dumi-raw-a-p-i/.test(node.value)) {
      node.value = node.value.replace(/ ?\/?>/g, '></dumi-raw-a-p-i>');
    }
  });

  // raw to hast tree
  const parsed = raw(ast);

  // restore React Component & it's properties
  visit<IDumiElmNode>(parsed, 'element', elm => {
    // restore tag name
    if (/^dumi-raw/.test(elm.tagName)) {
      elm.tagName = elm.tagName
        .replace('dumi-raw', '')
        .replace(/-([a-z])/g, (_, word) => word.toUpperCase());
    }

    // restore properties from temp array
    if (has(elm, '_index')) {
      elm.properties = props[elm.properties._index];
    }
  });

  return parsed;
};
