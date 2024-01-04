import { defaultTitle, getVueApp } from './getPreviewerData';

export function modifyStackBlitzData(memo, props) {
  const { title, description } = props;
  const config = {
    title: title || defaultTitle,
    description,
    template: 'node',
    files: {},
    dependencies: {},
  };

  const files = getVueApp(props);

  config.files = Object.entries(files).reduce((acc, [k, v]) => {
    acc[k] = v.content;
    return acc;
  }, {} as Record<string, string>);
  Object.assign(memo, config);
  return memo;
}
