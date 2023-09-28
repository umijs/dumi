import { extname, join } from 'path';
import type { IApi } from 'umi';
import { Mustache, fsExtra, winPath } from 'umi/plugin-utils';

export default function (api: IApi) {
  // Runtime configuration
  // 1. Provide the previewer override methods
  // 2. Give the rendering method of non-React framework in React framework

  api.addRuntimePlugin(() => {
    return [
      winPath(
        join(api.paths.absTmpPath, `plugin-${api.plugin.key}`, 'runtime.tsx'),
      ),
    ];
  });

  api.onGenerateFiles(() => {
    const runtimePath = join(__dirname, '../runtime');
    const files = fsExtra.readdirSync(runtimePath, {
      withFileTypes: true,
    });

    files.forEach((dirent) => {
      if (!dirent.isFile()) return;
      let content = fsExtra.readFileSync(
        join(runtimePath, dirent.name),
        'utf8',
      );
      const ext = extname(dirent.name);
      if (ext === '.tpl') {
        const options = api.userConfig.themeConfig?.vue;
        content = Mustache.render(content, options);
      }
      api.writeTmpFile({
        path: dirent.name.replace('.tpl', ''),
        content,
      });
    });
  });
}
