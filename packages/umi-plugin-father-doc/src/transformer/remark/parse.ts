import parse from 'remark-parse';

const { blockTokenizers } = parse.Parser.prototype as any;
const oFencedCode = blockTokenizers.fencedCode;

// override original fencedCode tokenizer
blockTokenizers.fencedCode = function (...args) {
  const result = oFencedCode.apply(this, args);

  // only process jsx & tsx code block
  if (result && /^[jt]sx$/.test(result.lang)) {
    if ((result.meta || '').indexOf('pure') > -1) {
      // clear useless meta if the lang with pure modifier
      result.meta = result.meta.replace(/ ?\| ?pure/, '');
    } else {
      // customize type (use for rehype previewer handler)
      result.type = 'previewer';
    }
  }

  return result;
}

export default parse;
