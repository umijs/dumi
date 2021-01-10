import visit from 'unist-util-visit';
import toHtml from 'hast-util-to-html';
import has from 'hast-util-has-property';
import is from 'hast-util-is-element';
import url from 'url';
import raw from './raw';
import type { IDumiUnifiedTransformer, IDumiElmNode } from '.';

export default function link(): IDumiUnifiedTransformer {
  return (ast, vFile) => {
    visit<IDumiElmNode>(ast, 'element', (node, i, parent) => {
      // handle internal link, external link & anchor link
      if (is(node, 'a') && has(node, 'href')) {
        let LinkComponent = 'Link';
        const parsedUrl = url.parse(node.properties.href);
        const children = (node.children || []).map(n => toHtml(n)).join('');
        let properties = Object.keys(node.properties)
          .filter(prop => !['href'].includes(prop))
          .map(prop => `${prop}="${node.properties[prop]}"`)
          .join(' ');

        // compatible with normal markdown link
        // see https://github.com/umijs/dumi/issues/181
        // TODO: https://github.com/umijs/dumi/issues/238
        if (/\.md$/i.test(parsedUrl.pathname) && !/^(\w+:)?\/\//.test(node.properties.href)) {
          parsedUrl.pathname = parsedUrl.pathname.replace(/\.md$/i, '');
        }

        // handle internal anchor link
        if (parsedUrl.hash && !parsedUrl.hostname) {
          LinkComponent = 'AnchorLink';
        }

        // replace original node
        if (this.data('outputType') === 'jsx') {
          parent.children[i] = raw()(
            {
              type: 'raw',
              value: `<${LinkComponent} to="${url.format(
                parsedUrl,
              )}" ${properties}>${children}</${LinkComponent}>`,
            },
            vFile,
          ) as IDumiElmNode;
        } else if (this.data('outputType') === 'html') {
          if (parsedUrl.hostname) {
            properties += ' target="_blank"';
          }

          parent.children[i] = raw()(
            {
              type: 'raw',
              value: `<a href="${url.format(parsedUrl)}" ${properties}>${children}${
                parsedUrl.hostname
                  ? toHtml({
                      type: 'element',
                      tagName: 'svg',
                      properties: {
                        xmlns: 'http://www.w3.org/2000/svg',
                        ariaHidden: true,
                        x: '0px',
                        y: '0px',
                        viewBox: '0 0 100 100',
                        width: 15,
                        height: 15,
                        className: `__dumi-default-external-link-icon`,
                      },
                      children: [
                        {
                          type: 'element',
                          tagName: 'path',
                          properties: {
                            fill: 'currentColor',
                            d:
                              'M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z',
                          },
                        },
                        {
                          type: 'element',
                          tagName: 'polygon',
                          properties: {
                            fill: 'currentColor',
                            points:
                              '45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9',
                          },
                        },
                      ],
                    })
                  : ''
              }</a>`,
            },
            vFile,
          ) as IDumiElmNode;
        }
      }
    });
  };
}
