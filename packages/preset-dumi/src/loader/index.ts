import * as babel from '@babel/core';
import loaderUtils from 'loader-utils';
import transformer from '../transformer';

export default function loader(content: string) {
  const options = loaderUtils.getOptions(this);
  const result = transformer.markdown(content, {
    fileAbsPath: this.resource,
    previewLangs: options.previewLangs,
  });

  return babel.transformSync(result.content, {
    presets: [require.resolve('@babel/preset-react'), require.resolve('@babel/preset-env')],
    babelrc: false,
    configFile: false,
  }).code;
}
