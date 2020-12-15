import { IDumiElmNode } from '.';

const ATTR_MAPPING = {
  hideactions: 'hideActions',
  defaultshowcode: 'defaultShowCode',
};

// https://developer.mozilla.org/en-US/docs/Web/HTML/Inline_elements#Elements
// prettier-ignore
const INLINE_ELEMENTS = [
  "a","abbr","acronym","audio","b","bdi","bdo","big","br","button","canvas","cite","code","data","datalist","del","dfn","em","embed","i","iframe","img","input","ins","kbd","label","map","mark","meter","noscript","object","output","picture","progress","q","ruby","s","samp","script","select","slot","small","span","strong","sub","sup","svg","template","textarea","time","u","tt","var","video","wbr"
];

/**
 * parse custome HTML element attributes to properties
 * @note  1. empty attribute will convert to true
 *        2. JSON-like string will convert to JSON
 *        3. workaround for restore property to camlCase that caused by hast-util-raw
 * @param   attrs   original attributes
 * @return  parsed properties
 */
export const parseElmAttrToProps = (attrs: { [key: string]: string }) => {
  const parsed: { [key: string]: any } = Object.assign({}, attrs);

  // restore camelCase attrs, because hast-util-raw will transform camlCase to lowercase
  Object.entries(ATTR_MAPPING).forEach(([mark, attr]) => {
    if (parsed[mark] !== undefined) {
      parsed[attr] = parsed[mark];
      delete parsed[mark];
    }
  });

  // convert empty string to boolean
  Object.keys(parsed).forEach(attr => {
    if (parsed[attr] === '') {
      parsed[attr] = true;
    }
  });

  // try to parse JSON field value
  Object.keys(parsed).forEach(attr => {
    if (/^(\[|{)[^]*(]|})$/.test(parsed[attr])) {
      try {
        parsed[attr] = JSON.parse(parsed[attr]);
      } catch (err) {
        /* nothing */
      }
    }
  });

  return parsed;
};

export function isInlineElement<N extends IDumiElmNode>(node: N) {
  return node.type === 'element' && INLINE_ELEMENTS.includes(node.tagName);
}
