import StackBlitzSDK, { Project } from '@stackblitz/sdk';
import { getParameters } from 'codesandbox-import-utils/lib/api/define';
import type { IPreviewerProps } from 'dumi';
import { genReactRenderCode } from './utils';

const CSB_API_ENDPOINT = 'https://codesandbox.io/api/v1/sandboxes/define';

function getCSBData(opts: IPreviewerProps) {
  const { entry = 'index.tsx', dependencies } = opts.asset;
  const match = /(.*)\.(js|ts|jsx|tsx)$/i.exec(entry);
  const [, , ext] = match ?? ['', 'index', 'tsx'];
  const isTSX = ext === 'tsx';
  const files: Record<
    string,
    {
      content: string;
      isBinary: boolean;
    }
  > = {};
  const deps: Record<string, string> = {};
  const entryFileName = `index.${ext}`;

  Object.entries(dependencies).forEach(([name, { type, value }]) => {
    if (type === 'NPM') {
      // generate dependencies
      deps[name] = value;
    } else {
      // append other imported local files
      files[name === entry ? `App.${ext}` : name] = {
        content: value,
        isBinary: false,
      };
    }
  });

  // add react、react-dom dependency
  deps['react'] ??= 'latest';
  deps['react-dom'] ??= deps.react;

  // append sandbox.config.json
  files['sandbox.config.json'] = {
    content: JSON.stringify(
      {
        template: 'create-react-app',
      },
      null,
      2,
    ),
    isBinary: false,
  };

  // append package.json
  files['package.json'] = {
    content: JSON.stringify(
      {
        name: opts.title,
        description: opts.description || 'An auto-generated demo by dumi',
        main: entryFileName,
        dependencies: deps,
        // add TypeScript dependency if required, must in devDeps to avoid csb compile error
        devDependencies: isTSX ? { typescript: '^4' } : {},
      },
      null,
      2,
    ),
    isBinary: false,
  };

  // append index.html
  files['index.html'] = {
    content: '<div style="margin: 16px;" id="root"></div>',
    isBinary: false,
  };

  // append entry file
  files[entryFileName] = {
    content: genReactRenderCode(deps.react),
    isBinary: false,
  };
  return { files };
}

function getStackBlitzData(data: IPreviewerProps) {
  const { entry = 'index.ts', dependencies } = data.asset;
  const match = /(.*)\.(js|ts|jsx|tsx)$/i.exec(entry);
  const [, , ext] = match ?? ['', 'index', 'tsx'];
  const isTSX = ext === 'tsx';

  const deps: Record<string, string> = {};
  const entryFileName = `index.${ext}`;
  const files: Record<string, string> = {
    'index.html': '<div style="margin: 16px;" id="root"></div>',
  };

  const config: Project = {
    title: data.title || '',
    description: data.description || 'An auto-generated demo by dumi',
    template: 'create-react-app',
    files: {},
  };

  Object.entries(dependencies).forEach(([name, { type, value }]) => {
    if (type === 'NPM') {
      // generate dependencies
      deps[name] = value;
    } else {
      // append other imported local files
      files[name === entry ? `App.${ext}` : name] = value;
    }
  });

  deps['react'] ??= 'latest';
  deps['react-dom'] ??= deps.react;

  files['package.json'] = JSON.stringify(
    {
      name: data.title,
      description: data.description || 'An auto-generated demo by dumi',
      dependencies: deps,
      // add TypeScript dependency if required, must in devDeps to avoid csb compile error
      devDependencies: isTSX ? { typescript: '^4' } : {},
    },
    null,
    2,
  );

  files[entryFileName] = genReactRenderCode(deps.react);

  config.files = files;
  return config;
}

export const reactDemoRuntimeApi = {
  techStackName: 'react',
  /**
   * get serialized data that use to submit to codesandbox.io
   * @param opts  previewer props
   */
  openCodeSandbox(opts: IPreviewerProps) {
    const form = document.createElement('form');
    const input = document.createElement('input');
    const CSBData = getCSBData(opts);
    form.method = 'POST';
    form.target = '_blank';
    form.style.display = 'none';
    form.action = opts?.api || CSB_API_ENDPOINT;
    form.appendChild(input);
    form.setAttribute('data-demo', opts.assets?.id || '');

    input.name = 'parameters';
    input.value = getParameters(CSBData);

    document.body.appendChild(form);

    form.submit();
    form.remove();
  },
  openStackBlitz(data: IPreviewerProps) {
    const config = getStackBlitzData(data);
    StackBlitzSDK.openProject(config);
  },
};
