import path from 'path';
import visit from 'unist-util-visit';
import { HTMLAttrParser } from './externalDemo';

function isAbsoluteUrl(url) {
  return /^(?:https?:)?\/\//.test(url);
}

export default function img() {
  return ast => {
    visit(ast, 'raw', node => {
      if (typeof node.value === 'string') {
        node.value = node.value.replace(/<img.*?\/?>/g, tag => {
          const matches = tag.match(/<img ([^>]+?)\/?>/) || [];
          const { src, ...inheritAttrs } = HTMLAttrParser(matches[1]);

          if (isAbsoluteUrl(src)) {
            return tag;
          } else {
            return `<img src={require('${path.join(
              path.parse(this.data('fileAbsPath')).dir,
              src,
            )}')} {...${JSON.stringify(inheritAttrs)}}>`;
          }
        });
      }
    });
  };
}
