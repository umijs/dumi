import StackBlitzSDK, { Project } from '@stackblitz/sdk';
import { IFiles, getParameters } from 'codesandbox-import-utils/lib/api/define';
import { IPreviewerProps } from 'dumi';

const defaultTitle = 'vue demo';
const defaultDesc = 'An auto-generated vue demo by dumi';

const CSB_API_ENDPOINT = 'https://codesandbox.io/api/v1/sandboxes/define';

const genIndexHtml = (
  title: string,
  description: string,
  entryFile: string,
) => {
  return `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="${description}" />
        <title>${title}</title>
    </head>
    <body>
        <div id="app"></div>
        <script type="module" src="${entryFile}"></script>
    </body>
</html>
`;
};

const genViteConfig = (tsx: boolean, sourceDir: string) => {
  return `
import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
${tsx ? `import vueJsx from '@vitejs/plugin-vue-jsx';` : ''}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
      vue(),${tsx ? 'vueJsx()' : ''}
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./${sourceDir}', import.meta.url))
        }
    }
});`;
};

const genRenderCode = (mainFileName: string) => `
import { createApp } from 'vue';
import App from './${mainFileName}';

const app = createApp(App);
app.config.errorHandler = (err) => console.error(err);
app.mount('#app');
`;

const tsconfig = `
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue"],
  "exclude": ["src/**/__tests__/*"],
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}`;

// the corresponding preprocessor map
const extDepMap: Record<string, [string, string]> = {
  less: ['less', '^4.2.0'],
  scss: ['sass', '^1.68.0'],
  sass: ['sass', '^1.68.0'],
  styl: ['stylus', '^0.60.0'],
};

function resolve(filename: string) {
  const match = /(.+)\.(\w+)$/i.exec(filename);
  if (!match) return match;
  const [, name, ext] = match;
  return { name, ext };
}

//entryFileName can be index.tsx, index.vue, index.jsx
//The configuration of index.vue is processed as a TypeScript project
function getVueApp({
  asset,
  title = defaultTitle,
  description = defaultDesc,
}: IPreviewerProps) {
  let entryFileName = asset.entry;
  const result = resolve(entryFileName);
  if (!result) return {};
  const { name, ext } = result;
  const isVue = ext === 'vue';
  let isTs = isVue || ext === 'tsx';
  const sourceDir = 'src/';

  const files: IFiles = {
    [`vite.config.${isTs ? 'ts' : 'js'}`]: {
      content: genViteConfig(isTs, sourceDir),
      isBinary: false,
    },
  };

  if (isTs) {
    files['tsconfig.json'] = { content: tsconfig, isBinary: false };
  }

  const deps: Record<string, string> = {};
  const devDeps: Record<string, string> = {
    '@vitejs/plugin-vue': '~4.0.0',
    vite: '~4.0.0',
  };

  const mainFileName = name === 'index' ? `App.${ext}` : entryFileName;

  Object.entries(asset.dependencies).forEach(([name, { type, value }]) => {
    if (type === 'NPM') {
      // generate dependencies
      deps[name] = value;
    } else {
      // append other imported local files
      files[
        name === entryFileName
          ? `${sourceDir}${mainFileName}`
          : `${sourceDir}${name}`
      ] = {
        content: value,
        isBinary: false,
      };
    }
    // Add style preprocessor dependency
    const result = resolve(name);
    if (!result) return;
    const dep = extDepMap[result.ext];
    if (!dep) return;
    const [depName, verison] = dep;
    devDeps[depName] = verison;
  });

  deps['vue'] ??= '^3.3';
  deps['vue-router'] ??= '^4.2';

  const previewerEntryFileName = isTs
    ? `${sourceDir}index.ts`
    : `${sourceDir}index.js`;

  if (isTs) {
    Object.assign(devDeps, {
      '@tsconfig/node18': '~18.2.2',
      '@types/node': '~18.17.17',
      '@vitejs/plugin-vue-jsx': '~3.0.2',
      '@vue/tsconfig': '~0.4.0',
      typescript: '~5.2.0',
      'vue-tsc': '~1.8.11',
    });
  }

  // append package.json
  files['package.json'] = {
    content: JSON.stringify(
      {
        description,
        main: previewerEntryFileName,
        dependencies: deps,
        scripts: {
          dev: 'vite',
          build: 'vite build',
          preview: 'vite preview',
        },
        browserslist: ['> 0.2%', 'not dead'],
        // add TypeScript dependency if required, must in devDeps to avoid csb compile error
        devDependencies: devDeps,
      },
      null,
      2,
    ),
    isBinary: false,
  };

  files['index.html'] = {
    content: genIndexHtml(title, description, previewerEntryFileName),
    isBinary: false,
  };
  files[previewerEntryFileName] = {
    content: genRenderCode(mainFileName),
    isBinary: false,
  };

  return files;
}

export function openCodeSandbox(props: IPreviewerProps) {
  const form = document.createElement('form');
  const input = document.createElement('input');
  const CSBData = { files: getVueApp(props) };
  form.method = 'POST';
  form.target = '_blank';
  form.style.display = 'none';
  form.action = props?.api || CSB_API_ENDPOINT;
  form.appendChild(input);
  form.setAttribute('data-demo', props.assets?.id || '');

  input.name = 'parameters';
  input.value = getParameters(CSBData);

  document.body.appendChild(form);

  form.submit();
  form.remove();
}

export function openStackBlitz(props: IPreviewerProps) {
  const { title, description } = props;
  const config: Project = {
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
  StackBlitzSDK.openProject(config);
}
