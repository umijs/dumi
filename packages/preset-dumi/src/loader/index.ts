import loaderUtils from 'loader-utils';
import transformer from '../transformer';

export default function loader(content: string) {
  const options = loaderUtils.getOptions(this);
  const result = transformer.markdown(content, {
    fileAbsPath: this.resource,
    previewLangs: options.previewLangs,
  });

  return result.content;
}
