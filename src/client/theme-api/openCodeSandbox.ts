import { getParameters } from 'codesandbox/lib/api/define';
import { ApplyPluginsType, type IPreviewerProps } from 'dumi';
import { genReactRenderCode, pluginManager } from './utils';

const CSB_API_ENDPOINT = 'https://codesandbox.io/api/v1/sandboxes/define';

/**
 * get serialized data that use to submit to codesandbox.io
 * @param opts  previewer props
 */
function getCSBData(opts: IPreviewerProps) {
  const isTSX = Boolean(opts.asset.dependencies?.['index.tsx']);
  const ext = isTSX ? '.tsx' : '.jsx';
  const files: Record<
    string,
    {
      content: string;
      isBinary: boolean;
    }
  > = {};
  const deps: Record<string, string> = {};
  const entryFileName = `index${ext}`;

  Object.entries(opts.asset.dependencies).forEach(([name, { type, value }]) => {
    if (type === 'NPM') {
      // generate dependencies
      deps[name] = value;
    } else {
      // append other imported local files
      files[name === entryFileName ? `App${ext}` : name] = {
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

  const csbOpts = pluginManager.applyPlugins({
    type: ApplyPluginsType.modify,
    key: 'modifyCodeSandboxData',
    initialValue: { files },
    args: opts,
  });

  return getParameters(csbOpts);
}

/**
 * use CodeSandbox.io
 * @param data  previewer opts
 * @param opts  the api that CodeSandbox calls when creating the demo
 * @note  return a open function for open demo on codesandbox.io
 */
export const openCodeSandbox = (
  data: IPreviewerProps,
  opts?: { api?: string },
) => {
  const form = document.createElement('form');
  const input = document.createElement('input');
  const CSBData = getCSBData(data);

  form.method = 'POST';
  form.target = '_blank';
  form.style.display = 'none';
  form.action = opts?.api || CSB_API_ENDPOINT;
  form.appendChild(input);
  form.setAttribute('data-demo', data.assets?.id || '');

  input.name = 'parameters';
  input.value = CSBData;

  document.body.appendChild(form);

  form.submit();
  form.remove();
};
