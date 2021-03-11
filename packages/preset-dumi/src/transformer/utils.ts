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
 * encode file require statement with raw loader & identifier, it can be decode after JSON.stringify
 */
export const RAW_ID = '^R^A^W^';
export const RAW_CHUNK_ID = '^C^H^U^N^K^';
export const encodeRawRequire = (resolvePath: string) =>
  `${RAW_ID}(${
    isDynamicEnable() ? `await import(${RAW_CHUNK_ID}` : 'require('
  }'!!dumi-raw-code-loader!${winPath(resolvePath)}')).default${RAW_ID}`;

export const decodeRawRequire = (str: string, chunkName: string) => {
  const escaped = RAW_ID.replace(/\^/g, '\\^');

  str = str.replace(new RegExp(`"${escaped}|${escaped}"`, 'g'), '');

  if (chunkName) {
    str = str.replace(
      new RegExp(RAW_CHUNK_ID.replace(/\^/g, '\\^'), 'g'),
      `/* webpackChunkName: "${chunkName}" */`,
    );
  }

  return str;
};
