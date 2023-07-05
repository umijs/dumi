import type { IPreviewerProps } from 'dumi';

const CODEPEN_API = 'https://codepen.io/pen/define';

const getDependencyData = (opts: IPreviewerProps) => {
  const isTSX = Boolean(opts.asset.dependencies?.['index.tsx']);
  let dep: Record<string, string> = {};
  let jsx = '';
  Object.keys(opts.asset.dependencies).forEach((current) => {
    const { type, value } = opts.asset.dependencies[current];
    if (type === 'NPM') {
      dep[current] = value;
    } else {
      jsx += value;
    }
  });

  /**
   * 依赖的 npm 包, 将所有的npm 包转成cdn 引入
   */
  const dependencyNpm = Object.keys(dep).map((name) => {
    return `${name}@${dep[name]}/dist/${name}.min.js`;
  });

  /** codepen
   * 需要替换成 const { Space } = antd
   * */
  const codepenPrefillConfig = {
    title: `例子`,
    html: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta name="theme-color" content="#000000">
      </head>
      <body>
        <div id="container" style="padding: 24px" />
        <script>const mountNode = document.getElementById('container');</script>
      </body>
    </html>`,
    js: `const { createRoot } = ReactDOM;\n${jsx
      .replace(
        /import\s+(?:React,\s+)?{(\s+[^}]*\s+)}\s+from\s+'react'/,
        `const { $1 } = React;`,
      )
      .replace(
        /import\s+{(\s+[^}]*\s+)}\s+from\s+'([\w\s]+)'/g,
        'const { $1 } = $2;',
      )
      .replace(
        /import\s+{(\s+[^}]*\s+)}\s+from\s+'@ant-design\/icons';/,
        'const { $1 } = icons;',
      )
      .replace(/import\s+([\w]+)\s+from\s+'lodash'/, '')
      .replace("import moment from 'moment';", '')
      .replace("import React from 'react';", '')
      .replace(
        /import\s+{\s+(.*)\s+}\s+from\s+'react-router';/,
        'const { $1 } = ReactRouter;',
      )
      .replace(/([A-Za-z]*)\s+as\s+([A-Za-z]*)/, '$1:$2')
      .replace(
        /export default/,
        'const ComponentDemo =',
      )}\n\ncreateRoot(mountNode).render(<ComponentDemo />);\n`,
    editors: '001',
    css: '',
    js_external: [
      'react@18/umd/react.development.js',
      'react-dom@18/umd/react-dom.development.js',
      'dayjs@1/dayjs.min.js',
      `@ant-design/icons/dist/index.umd.js`,
      'react-router-dom/dist/umd/react-router-dom.production.min.js',
      'react-router/dist/umd/react-router.production.min.js',
      'lodash@4.17.21/lodash.js',
    ]
      .concat(dependencyNpm)
      .map((url) => `https://unpkg.com/${url}`)
      .join(';'),
    js_pre_processor: isTSX ? 'typescript' : 'javascript',
  };
  return codepenPrefillConfig;
};

export const openCodePen = (data: IPreviewerProps, opts?: { api?: string }) => {
  const form = document.createElement('form');
  const input = document.createElement('input');
  const CSBData = getDependencyData(data);

  form.method = 'POST';
  form.target = '_blank';
  form.style.display = 'none';
  form.action = opts?.api || CODEPEN_API;
  form.appendChild(input);
  form.setAttribute('data-demo', data.assets?.id || '');

  input.name = 'data';
  input.value = JSON.stringify(CSBData);

  document.body.appendChild(form);

  form.submit();
  form.remove();
};
