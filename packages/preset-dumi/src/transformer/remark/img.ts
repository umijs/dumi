import path from 'path';
import visit from 'unist-util-visit';
import has from 'hast-util-has-property';
import is from 'hast-util-is-element';
import { HTMLAttrParser } from './externalDemo';

function isRelativeUrl(url) {
  return typeof url === 'string' && !/^(?:\w+:)?\/\//.test(url) && !path.isAbsolute(url);
}

export default function img() {
  return ast => {
    visit(ast, 'element', (node, i, parent) => {
      if (is(node, 'img') && has(node, 'src') && isRelativeUrl(node.properties.src)) {
        parent.children[i] = {
          type: 'raw',
          value: `<img src={require('${node.properties.src}')}>`,
        };
      }
    });

    visit(ast, 'raw', node => {
      if (typeof node.value === 'string') {
        node.value = node.value.replace(/<img.*?\/?>/g, tag => {
          // FIX ME: raw visitor will execute repeat after element visit on Windows OS, temporary way to solve it
          if (!tag.includes('src={require')) {
            const matches = tag.match(/<img ([^>]+?)\/?>/) || [];
            const { src, ...inheritAttrs } = HTMLAttrParser(matches[1]);

            if (isRelativeUrl(src)) {
              return `<img src={require('${src}')} {...${JSON.stringify(inheritAttrs)}}>`;
            }
          }

          return tag;
        });
      }
    });
  };
}
