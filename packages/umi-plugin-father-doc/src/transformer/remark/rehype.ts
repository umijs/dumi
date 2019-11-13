import rehype from 'remark-rehype';
import unist from 'unist-builder';
import transformer, { PREVIEWER_NAME } from '../previewer';

/**
 * handle previewer type node from parse
 */
function previewerHandler(h, node) {
  const code = `{(function () {
    ${transformer(node.value, node.basePath || this.fileAbsDir, node.lang === 'tsx')}
    return <${PREVIEWER_NAME} />;
  })()}`
  ;

  return h(node.position, 'div', [unist('raw', code)]);
}

export default (options: { [key: string]: any } = {}) => {
  return rehype(Object.assign({
    handlers: {
      previewer: previewerHandler.bind({ fileAbsDir: options.fileAbsDir }),
    },
    allowDangerousHTML: true,
  }, options));
}
