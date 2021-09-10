import path from 'path';
import slash from 'slash2';
import visit from 'unist-util-visit';
import toHtml from 'hast-util-to-html';
import has from 'hast-util-has-property';
import is from 'hast-util-is-element';
import url from 'url';
import raw from './raw';
import ctx from '../../context';
import decorator from '../../routes/decorator';
import getRouteConfigFromFile from '../../routes/getRouteConfigFromFile';
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

        // if possible, generate route for the markdown link and rcfile link
        if (
          (/\.md$/i.test(parsedUrl.pathname) || /\.(t|j)sx$/i.test(parsedUrl.pathname)) &&
          !/^(\w+:)?\/\//.test(node.properties.href)
        ) {
          const cwd = ctx.umi?.cwd ?? process.cwd();
          const filePath = slash(path.join(path.dirname(vFile.data.filePath), parsedUrl.pathname));
          const routes = getRouteConfigFromFile(path.join(cwd, filePath), ctx.opts);
          if (routes) {
            const finalRoutes = decorator([routes], ctx.opts, ctx.umi);
            parsedUrl.pathname = finalRoutes.find(
              ({ component }) => component === `../${filePath}`,
            ).path;
          }
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
                            d: 'M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z',
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
