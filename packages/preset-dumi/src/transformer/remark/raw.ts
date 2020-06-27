import visit from 'unist-util-visit';
import raw from 'hast-util-raw';

/**
 * rehype plugin for compile raw node to hast
 */
export default () => ast => {
  // workaround to avoid lowercase for React Component tag name
  visit(ast, 'raw', (node, i, parent) => {
    // mark React Compnoent via dumi-raw prefixer, eg Alert => dumi-raw-alert
    node.value = (node.value as string).replace(/(<\/?)([A-Z]\w)+/g, (_, prefix, tagName) => {
      return `${prefix}dumi-raw${tagName.replace(/[A-Z]/g, s => `-${s.toLowerCase()}`)}`;
    });

    const parsed = raw(node);

    // restore React Component
    visit(parsed, 'element', elm => {
      if (/^dumi-raw/.test(elm.tagName as string)) {
        elm.tagName = (elm.tagName as string)
          .replace('dumi-raw', '')
          .replace(/-([a-z])/g, (_, word) => word.toUpperCase());
      }
    });

    // replace original node
    (parent.children as Array<any>).splice(
      i,
      1,
      // ignore root element if there has parent node
      ...(parent && parsed.type === 'root' ? parsed.children : [parsed]),
    );
  });
};
