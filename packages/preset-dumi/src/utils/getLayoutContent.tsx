export default (
  path: string,
) => `import React from 'react';
// @ts-ignore
import GITHUB_COMMITS from './github-commits.json';

export default (props) => {
  return React.createElement(require('${path}').default, {
    GITHUB_COMMITS,
    ...props
  })
}
`;
