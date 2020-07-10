/* eslint-disable no-new-wrappers */
/**
 * transform props base on JSX rule
 * @param props   original props
 */
export const formatJSXProps = (props: { [key: string]: any }): { [key: string]: any } => {
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

    return result;
  }, {});
};
