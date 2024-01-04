import { join } from 'path';
import type { IApi } from 'umi';
import { fsExtra, winPath } from 'umi/plugin-utils';

const runtimePlugins = ['modifyCodeSandboxData.ts', 'modifyStackBlitzData.ts'];
const generateFiles = [...runtimePlugins, 'getPreviewerData.ts'];

export default function (api: IApi) {
  const tplPath = join(__dirname, '../../templates');

  api.onGenerateFiles(() => {
    generateFiles.forEach((filename) => {
      let content = fsExtra.readFileSync(join(tplPath, filename), 'utf8');
      api.writeTmpFile({
        path: filename,
        content,
      });
    });
  });

  runtimePlugins.forEach((plugin) => {
    api.addRuntimePlugin(() => {
      return [
        winPath(join(api.paths.absTmpPath, `plugin-${api.plugin.key}`, plugin)),
      ];
    });
  });
}
