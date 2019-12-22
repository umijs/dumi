import visit from 'unist-util-visit';
import has from 'hast-util-has-property';
import is from 'hast-util-is-element';

function isAbsoluteUrl(url) {
  return /^(?:https?:)?\/\//.test(url);
}

export default () => ast => {
  visit(ast, 'element', node => {
    if (is(node, 'a') && has(node, 'href') && isAbsoluteUrl(node.properties.href)) {
      node.properties = node.properties || {};
      Object.assign(node.properties, {
        target: '_blank',
      });
      node.children.push({
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
          className: `__father-doc-default-external-link-icon`
        },
        children: [{
          type: 'element',
          tagName: 'path',
          properties: {
            fill: 'currentColor',
            d: 'M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z',
          }
        }, {
          type: 'element',
          tagName: 'polygon',
          properties: {
            fill: 'currentColor',
            points: '45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9',
          }
        }]
      })
    }
  });
};
