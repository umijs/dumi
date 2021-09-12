import fs from 'fs';
import { winPath } from '@umijs/utils';
import ctx from '../context';

/* eslint-disable no-new-wrappers */
/**
 * transform props base on JSX rule
 * @param props   original props
 */
export const formatJSXProps = (props: Record<string, any>): Record<string, any> => {
  const OMIT_NULL_PROPS = ['alt', 'align'];

  return Object.keys(props || {}).reduce((result, key) => {
    // ignore useless empty props
    if (props[key] !== null || !OMIT_NULL_PROPS.includes(key)) {
      result[key] = props[key];
    }

    // use wrapper object for workaround implement raw props render
    // https://github.com/mapbox/jsxtreme-markdown/blob/main/packages/hast-util-to-jsx/index.js#L167
    if (
      !(props[key] instanceof String) &&
      props[key] !== null &&
      (typeof props[key] === 'object' || Array.isArray(props[key]))
    ) {
      result[key] = new String(JSON.stringify(props[key]));
    }

    // join className to string
    if (key === 'className' && Array.isArray(props[key])) {
      result[key] = props[key].join(' ');
    }

    return result;
  }, {});
};

/**
 * get umi dynamicImport flag
 */
export function isDynamicEnable() {
  return Boolean(ctx.umi?.config?.dynamicImport);
}

/**
 * encode & decode import statement which need to hoist at the top of file
 */
const HOIST_ID = '^H^O^I^S^T^';
export const encodeHoistImport = (resolvePath: string) =>
  `import ${HOIST_ID} from '!!dumi-raw-code-loader!${winPath(resolvePath)}?dumi-raw-code'`;
export const decodeHoistImport = (str: string, id: string) =>
  str.replace(new RegExp(HOIST_ID.replace(/\^/g, '\\^'), 'g'), id);
export const isHoistImport = (str: string) => str.startsWith(`import ${HOIST_ID} from`);
export const decodeHoistImportToContent = (str: string) => {
  if (isHoistImport(str)) {
    const filePath = str.match(/dumi\-raw\-code\-loader!([^\?]+)\?/)?.[1];

    return fs.readFileSync(filePath, 'utf-8').toString();
  }

  return str;
};

/**
 * encode import/require statement by dynamicImport, it can be decode to await import statement with chunkName
 */
export const CHUNK_ID = '^C^H^U^N^K^';
export const encodeImportRequire = (resolvePath: string) =>
  `(${isDynamicEnable() ? `await import(${CHUNK_ID}` : 'require('}'${winPath(
    resolvePath,
  )}')).default`;
export const decodeImportRequire = (str: string, chunkName: string) =>
  str.replace(
    new RegExp(CHUNK_ID.replace(/\^/g, '\\^'), 'g'),
    `/* webpackChunkName: "${chunkName}" */`,
  );
export const isEncodeImport = (str: string) => str.startsWith(`(await import(${CHUNK_ID}`);
export const decodeImportRequireWithAutoDynamic = (str: string, chunkName: string) =>
  isEncodeImport(str)
    ? `dynamic({
      loader: async () => ${decodeImportRequire(str, chunkName)},
    })`
    : decodeImportRequire(str, chunkName);
