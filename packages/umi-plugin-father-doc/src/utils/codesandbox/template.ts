export const newpkgJSON = (
  dependencies: any = {},
  name = 'father-doc-example',
  main = 'index.js',
  devDependencies: any = {},
  desc = 'An auto generated demo by father-doc',
) => `{
  "name": "${name}",
  "version": "0.0.0",
  "description": "${desc}",
  "main": "${main}",
  "dependencies": {
    ${Object.keys(dependencies)
      .map(k => `"${k}": "${dependencies[k]}"`)
      .join(',\n    ')}
  },
  "devDependencies": {
    ${Object.keys(devDependencies)
      .map(k => `"${k}": "${devDependencies[k]}"`)
      .join(',\n    ')}
  }
}`;
