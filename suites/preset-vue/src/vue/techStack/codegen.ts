import { join } from 'path';
import type { IApi } from 'umi';
import { fsExtra, winPath } from 'umi/plugin-utils';

import { LOAD_COMPILER, VUE_RENDERER_KEY } from '@/shared';

const BABEL_STANDALONE_CDN =
  'https://unpkg.com/@babel/standalone@7/babel.min.js';

function getPluginPath(api: IApi, filename: string) {
  return winPath(
    join(api.paths.absTmpPath, `plugin-${api.plugin.key}`, filename),
  );
}

const renderFile = 'render.ts';
const loadCompilerFile = 'loadCompiler.ts';

export default function codegen(api: IApi) {
  const tplPath = join(__dirname, '../../../templates');
  const libPath = join(__dirname, '../../../lib');

  const vueConfig = api.userConfig?.vue;

  // generate vue render code

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: renderFile,
      tplPath: join(tplPath, 'render.tpl'),
      context: {
        pluginKey: VUE_RENDERER_KEY,
      },
    });
  });

  api.addRuntimePluginKey(() => [VUE_RENDERER_KEY, LOAD_COMPILER]);

  api.addRuntimePlugin(() => getPluginPath(api, renderFile));

  api.onGenerateFiles(() => {
    // compiler running in browser
    api.writeTmpFile({
      path: 'compiler.js',
      content: fsExtra.readFileSync(join(libPath, 'compiler.mjs'), 'utf8'),
    });
    api.writeTmpFile({
      path: 'compiler.d.ts',
      content: fsExtra.readFileSync(join(libPath, 'compiler.d.mts'), 'utf8'),
    });

    // file to load compiler
    api.writeTmpFile({
      path: loadCompilerFile,
      tpl: `
      export async function {{{pluginKey}}}() {
        return import('./compiler').then(({ compile }) =>  compile);
      }
      `,
      context: {
        pluginKey: LOAD_COMPILER,
      },
    });
  });
  api.addRuntimePlugin(() => getPluginPath(api, loadCompilerFile));

  // add @babel/standalone script
  api.addHTMLHeadScripts(() => {
    return [
      {
        src: vueConfig?.compiler?.babelStandaloneCDN || BABEL_STANDALONE_CDN,
        async: true,
      },
    ];
  });
}
