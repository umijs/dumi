import rehype from 'remark-rehype';
import unist from 'unist-builder';
import transformer, { DEMO_COMPONENT_NAME } from '../demo';

/**
 * handle demo type node from parse
 */
function demoHandler(h, node) {
  const code = `{(function () {
    ${transformer(node.value, node.basePath || this.fileAbsDir, node.lang === 'tsx')}
    return <${DEMO_COMPONENT_NAME} />;
  })()}`
  ;

  return h(node.position, 'div', [unist('raw', code)]);
}

export default (options: { [key: string]: any } = {}) => {
  return rehype(Object.assign({
    handlers: {
      demo: demoHandler.bind({ fileAbsDir: options.fileAbsDir }),
    },
    allowDangerousHTML: true,
  }, options));
}
