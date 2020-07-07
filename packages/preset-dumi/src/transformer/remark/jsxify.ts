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

    let JSX = toJSX(ast, { wrapper: 'fragment' }) || '';

    // TODO: find a elegant way to keep camelCase props like defaultShowCode or hideActions
    JSX = JSX.replace(/hide-actions={\[/g, 'hideActions={[').replace(
      /default-show-code={true}/g,
      'defaultShowCode',
    );

    return JSX;
  };
}
