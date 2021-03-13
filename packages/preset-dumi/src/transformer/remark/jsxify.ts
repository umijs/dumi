import type { Processor } from 'unified';
import toJSX from '@mapbox/hast-util-to-jsx';
import visit from 'unist-util-visit';
import { formatJSXProps } from '../utils';

/**
 * rehype compiler for compile hast to jsx
 */
export default (function jsxify() {
  this.Compiler = function compiler(ast) {
    // format props for JSX element
    visit(ast, 'element', node => {
      node.properties = formatJSXProps(node.properties);
    });

    let JSX = toJSX(ast, { wrapper: 'fragment' }) || '';

    // append previewProps for previewer
    JSX = JSX.replace(
      /data-previewer-props-replaced="([^"]+)"/g,
      "{...DUMI_ALL_DEMOS['$1'].previewerProps}",
    );

    return JSX;
  };
} as Processor);
