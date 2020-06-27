import toJSX from '@mapbox/hast-util-to-jsx';
import visit from 'unist-util-visit';
import { formatJSXProps } from '../utils';

/**
 * rehype compiler for compile hast to jsx
 */
export default function jsxify() {
  this.Compiler = function compiler(ast) {
    // format props for JSX element
    visit(ast, 'element', node => {
      node.properties = formatJSXProps(node.properties);
    });

    return toJSX(ast, { wrapper: 'fragment' });
  };
}
