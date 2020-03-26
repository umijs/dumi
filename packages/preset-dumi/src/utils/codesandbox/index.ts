import getParameters from './getParams';
import { newpkgJSON } from './template';

const ensureReact = (deps: any) => {
  if (!deps.react && !deps['react-dom']) {
    deps.react = 'latest';
    deps['react-dom'] = 'latest';
  } else if (!deps.react) {
    deps.react = deps['react-dom'];
  } else if (!deps['react-dom']) {
    deps['react-dom'] = deps.react;
  }
};

export const issueLink = `/** This is an auto-generated demo by dumi
* if you think it is not working as expected,
* please report the issue at
* https://github.com/umijs/dumi/issues
**/
ReactDOM.render(
  <App />,
  document.getElementById('root')
);`;

export default ({ files, deps, devDependencies, desc }: any, config: any) => {
  if (!config) config = {};
  const { extraFiles, extraDependencies, name, template = 'create-react-app' } = config;
  let { main } = config;
  const dependencies = {
    ...deps,
    ...extraDependencies,
  };

  main = !main && template === 'create-react-app-typescript' ? 'index.tsx' : 'index.js';

  ensureReact(dependencies);

  const finalFiles = {
    ...files,
    'package.json': {
      content: newpkgJSON(dependencies, name, main, devDependencies || {}, desc),
    },
    'sandbox.config.json': {
      content: JSON.stringify({
        template,
      }),
    },
    ...extraFiles,
  };
  const parameters = getParameters({
    files: finalFiles,
  });
  return {
    files: finalFiles,
    dependencies,
    parameters,
  } as any;
};
