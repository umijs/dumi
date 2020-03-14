export default (path: string, nodeModulesPath: string) => `import React from 'react';
// @ts-ignore
import GITHUB_COMMITS from '${nodeModulesPath}/.dumi/github-commits.json';

export default (props) => {
  return React.createElement(require('${path}').default, {
    GITHUB_COMMITS,
    ...props
  })
}
`;
