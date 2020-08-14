import visit from 'unist-util-visit';
import toHtml from 'hast-util-to-html';
import has from 'hast-util-has-property';
import is from 'hast-util-is-element';
import url from 'url';

export default () => ast => {
  visit(ast, 'element', (node, i, parent) => {
    // handle internal link, external link & anchor link
    if (is(node, 'a') && has(node, 'href')) {
      let LinkComponent = 'Link';
      let parsedUrl = url.parse(node.properties.href);
      const children = (node.children || []).map(n => toHtml(n)).join('');
      const properties = Object.keys(node.properties)
        .filter(prop => !['href'].includes(prop))
        .map(prop => `${prop}="${node.properties[prop]}"`)
        .join(' ');

      // compatible with normal markdown link
      // see https://github.com/umijs/dumi/issues/181
      // TODO: https://github.com/umijs/dumi/issues/238
      if (/\.md$/i.test(parsedUrl.pathname)) {
        parsedUrl.pathname = parsedUrl.pathname.replace(/\.md$/i, '');
      }

      // handle anchor link
      if (parsedUrl.hash) {
        LinkComponent = 'AnchorLink';
      }

      // replace original node
      parent.children[i] = {
        type: 'raw',
        value: `<${LinkComponent} to="${url.format(
          parsedUrl,
        )}" ${properties}>${children}</${LinkComponent}>`,
      };
    }
  });
};
