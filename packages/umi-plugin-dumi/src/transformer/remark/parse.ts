import parse, { RemarkParseOptions } from 'remark-parse';
import { Plugin } from 'unified';
import transformer from '..';

export interface IParseProps extends RemarkParseOptions {
  /**
   * transform strategy
   * @note  turn on all markdown tokenizers by default
   *        only turn on tokenizers which use for parse yaml data if pass 'data'
   */
  strategy: 'default' | 'data';
}

const { blockTokenizers, inlineTokenizers, setOptions } = parse.Parser.prototype as any;
const oFencedCode = blockTokenizers.fencedCode;
const DISABLEABLE_TOKENIZERS = [
  'indentedCode',
  'fencedCode',
  'blockquote',
  'thematicBreak',
  'list',
  'setextHeading',
  'html',
  'footnote',
  'definition',
  'table',
  'escape',
  'autoLink',
  'url',
  'html',
  'link',
  'reference',
  'strong',
  'emphasis',
  'deletion',
  'code',
  'break',
];

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

  // only process jsx & tsx code block
  if (result && /^[jt]sx$/.test(result.lang)) {
    const modifier = codeBlockModifierParser(result.meta);
    // extract frontmatters for embedded demo and omit the useless slugs field
    const { content, config: { slugs, ...config } } = transformer[result.lang](result.value);

    if (modifier.pure) {
      // clear useless meta if the lang with pure modifier
      result.meta = result.meta.replace(/ ?\| ?pure/, '');
    } else {
      // customize type (use for rehype demo handler)
      result.type = 'demo';
      result.meta = { ...modifier, ...config };
      result.value = content;
    }
  }

  return result;
};

/**
 * a decorator use for turn off tokenizer feature
 * @param oTokenizer the original tokenizer
 */
function tokenizerDecorator(oTokenizer) {
  const tokenizer = function(...args) {
    // turn off disableable tokenizers if strategy is 'data'
    if (this.options.strategy === 'data' && DISABLEABLE_TOKENIZERS.indexOf(oTokenizer.name) > -1) {
      return true;
    }

    return oTokenizer.apply(this, args);
  };

  if (oTokenizer.locator) {
    tokenizer.locator = oTokenizer.locator;
  }

  return tokenizer;
}

// decorate for all block tokenizers
Object.keys(blockTokenizers).forEach(method => {
  blockTokenizers[method] = tokenizerDecorator(blockTokenizers[method]);
});

// decorate for all inline tokenizers
Object.keys(inlineTokenizers).forEach(method => {
  inlineTokenizers[method] = tokenizerDecorator(inlineTokenizers[method]);
});

// proxy set options to avoid remove the custom strategy option
(parse.Parser.prototype as any).setOptions = function(opts) {
  if (this.options.strategy) {
    opts.strategy = this.options.strategy;
  }
  setOptions.call(this, opts);
};

export default parse as Plugin<[Partial<IParseProps>?]>;
