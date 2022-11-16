import sdk, { Project } from '@stackblitz/sdk';
import type { IPreviewerProps } from 'dumi';
import { genReactRenderCode } from './utils';

export const openStackBlitz = (data: IPreviewerProps) => {
  const isTSX = Boolean(data.asset.dependencies?.['index.tsx']);
  const ext = isTSX ? '.tsx' : '.jsx';

  const deps: Record<string, string> = {};
  const entryFileName = `index${ext}`;
  const files: Record<string, string> = {
    'index.html': '<div style="margin: 16px;" id="root"></div>',
  };

  const config: Project = {
    title: data.title || '',
    description: data.description || 'An auto-generated demo by dumi',
    template: 'create-react-app',
    files: {},
  };

  Object.entries(data.asset.dependencies).forEach(([name, { type, value }]) => {
    if (type === 'NPM') {
      // generate dependencies
      deps[name] = value;
    } else {
      // append other imported local files
      files[name === entryFileName ? `App${ext}` : name] = value;
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

  sdk.openProject(config);
};
