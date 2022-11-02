import { getParameters } from 'codesandbox/lib/api/define';

import type { IPreviewerProps } from 'dumi';

const CSB_API_ENDPOINT = 'https://codesandbox.io/api/v1/sandboxes/define';

/**
 * 在 react 18 中需要新的 render 方式，这个函数用来处理不同的 jsx 模式。
 * @param  { 'react-dom' | 'react-dom/client'} clientRender
 * @returns code string
 */
const genReactRenderCode = (
  clientRender: 'react-dom' | 'react-dom/client',
): string => {
  if (clientRender === 'react-dom') {
    return `/**
* This is an auto-generated demo by dumi
* if you think it is not working as expected,
* please report the issue at
* https://github.com/umijs/dumi/issues
**/
    
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
    
ReactDOM.render(
  <App />,
  document.getElementById('root'),
);`;
  }
  return `/**
* This is an auto-generated demo by dumi
* if you think it is not working as expected,
* please report the issue at
* https://github.com/umijs/dumi/issues
**/
import React from 'react';
import { createRoot } from "react-dom/client";
import App from "./App";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(<App />);`;
};

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
        template: isTSX ? 'create-react-app-typescript' : 'create-react-app',
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
    content: genReactRenderCode(
      // react 18 需要使用新的 render 方式
      deps?.['react-dom']?.startsWith('18.') || deps.react === 'latest'
        ? 'react-dom/client'
        : 'react-dom',
    ),
    isBinary: false,
  };

  return getParameters({ files });
}

/**
 * use CodeSandbox.io
 * @param opts  previewer opts
 * @note  return a open function for open demo on codesandbox.io
 */
export const useCodeSandbox = (
  opts: IPreviewerProps,
  api: string = CSB_API_ENDPOINT,
) => {
  const handler = () => {
    const form = document.createElement('form');
    const input = document.createElement('input');
    const data = getCSBData(opts);

    form.method = 'POST';
    form.target = '_blank';
    form.style.display = 'none';
    form.action = api;
    form.appendChild(input);
    form.setAttribute('data-demo', opts.title || '');

    input.name = 'parameters';
    input.value = data;

    document.body.appendChild(form);

    form.submit();
    form.remove();
  };

  return handler;
};
