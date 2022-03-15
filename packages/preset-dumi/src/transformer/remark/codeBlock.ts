import visit from 'unist-util-visit';
// import { winEOL } from '@umijs/utils';
import type { Code } from 'mdast';
import type { IDumiUnifiedTransformer } from '.';
import transformer from '..';
import ctx from '../../context';

// TODO: UMI4 utils not winEOL
const isWindows =
  typeof process !== 'undefined' && process.platform === 'win32';

const winEOL = (content: string | undefined) => {
  if (typeof content !== 'string') {
    return content;
  }
  return isWindows ? content.replace(/\r/g, '') : content;
};

/**
 * parser for parse modifier of code block
 * @param meta  meta raw string
 */
function codeBlockModifierParser(meta: string): Record<string, any> {
  return (meta || '').split('|').reduce((result, item) => {
    item = String.prototype.trim.call(item);

    if (item) {
      result[item] = true;
    }

    return result;
  }, {});
}

/**
 * rehype plugin for convert code block to demo compomnent
 */
export default function codeBlock(): IDumiUnifiedTransformer {
  return ast => {
    // handle md code block syntax
    visit<Code>(ast, 'code', node => {
      const resolve = ctx.opts?.resolve
      const modifier = codeBlockModifierParser(node.meta);
      if (
        resolve?.previewLangs.includes(node.lang) &&
        (
          !resolve?.passivePreview ||
          (resolve.passivePreview && modifier.preview)
        )
      ) {
        // extract frontmatters for embedded demo
        const { content, meta } = transformer.code(winEOL(node.value));

        if (modifier.pure) {
          // clear useless meta if the lang with pure modifier
          node.meta = node.meta.replace(/ ?\| ?pure/, '') || null;
        } else {
          // customize type (use for rehype demo handler)
          node.type = 'demo' as any;
          node.meta = { ...modifier, ...meta } as any;
          node.value = content;
        }
      }
    });
  };
}
