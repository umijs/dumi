import parse from 'remark-parse';
import { filenameToPath } from '../../routes/getRouteConfigFromDir';

const { blockTokenizers, inlineTokenizers } = parse.Parser.prototype as any;
const oFencedCode = blockTokenizers.fencedCode;
const oHtml = inlineTokenizers.html;

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

// override original inline html tokenizer
inlineTokenizers.html = function (...args) {
  const result = oHtml.apply(this, args);

  // replace internal .md link
  if (result?.type === 'html' && /^<a.* href=/.test(result.value)) {
    result.value = result.value.replace(/^(.*href=['"]?)([^ '">]*\.md)(['"]?.*)$/, (origin, head, link, foot) => {
      let str = origin;

      if (link) {
        str = `${
          head
        }${
          // convert .md file path to route path
          filenameToPath(link.replace(/(\/index)?\.md$/, ''))
        }${
          foot
        }`
      }

      return str;
    });
  }

  return result;
}
inlineTokenizers.html.locator = oHtml.locator;

export default parse;
