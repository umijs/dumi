import { getVueApp } from './getPreviewerData';

export function modifyCodeSandboxData(memo, props) {
  Object.assign(memo, { files: getVueApp(props) });
  return memo;
}
