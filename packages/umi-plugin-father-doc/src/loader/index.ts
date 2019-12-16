import * as babel from '@babel/core';
import transformer from '../transformer';

export default function loader(content: string) {
  const result = transformer.markdown(content, this.context);

  return babel.transformSync(result.content, {
    presets: [require.resolve('@babel/preset-react'), require.resolve('@babel/preset-env')],
    babelrc: false,
    configFile: false,
  }).code;
}
