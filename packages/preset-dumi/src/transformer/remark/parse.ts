import parse from 'remark-parse';
import ctx from '../../context';
import transformer from '..';

const { blockTokenizers } = parse.Parser.prototype as any;
const oFencedCode = blockTokenizers.fencedCode;

/**
 * parser for parse modifier of code block
 * @param meta  meta raw string
 */
function codeBlockModifierParser(meta: string): { [key: string]: any } {
  return (meta || '').split('|').reduce((result, item) => {
    item = String.prototype.trim.call(item);

    if (item) {
      result[item] = true;
    }

    return result;
  }, {});
}

// override original fencedCode tokenizer
blockTokenizers.fencedCode = function fencedCode(...args) {
  const result = oFencedCode.apply(this, args);

  // only process needed code block
  if (result && ctx.opts?.resolve.previewLangs.indexOf(result.lang) > -1) {
    const modifier = codeBlockModifierParser(result.meta);
    // extract frontmatters for embedded demo
    const { content, meta } = transformer.code(result.value);

    if (modifier.pure) {
      // clear useless meta if the lang with pure modifier
      result.meta = result.meta.replace(/ ?\| ?pure/, '');
    } else {
      // customize type (use for rehype demo handler)
      result.type = 'demo';
      result.meta = { ...modifier, ...meta };
      result.value = content;
    }
  }

  return result;
};

/**
 * wrap remark-parse for parse code block to demo node
 */
export default parse;
