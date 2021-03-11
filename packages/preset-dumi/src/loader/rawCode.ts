import transformer from '../transformer';

/**
 * loader for strip frontmatter from source code
 * @param raw   source
 */
export default async function loader(raw: string) {
  const json = JSON.stringify(transformer.code(raw).content.trimEnd())
    // refer: https://bugs.chromium.org/p/v8/issues/detail?id=1907#c6
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  return `export default ${json}`;
}
