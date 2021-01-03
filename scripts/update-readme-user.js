const { readFileSync, writeFileSync } = require('fs');

// **************************************************************************

let users = [
  {
    name: 'UmiJS',
    url: 'https://umijs.org',
    logo: 'https://gw.alipayobjects.com/zos/bmw-prod/598d14af-4f1c-497d-b579-5ac42cd4dd1f/k7bjua9c_w132_h130.png'
  },
  {
    name: 'ahooks',
    url: 'https://ahooks.js.org/',
    logo: 'https://ahooks.js.org/logo.svg'
  },
  {
    name: 'Pro Components',
    url: 'https://procomponents.ant.design/',
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg'
  },
  {
    name: 'react-component',
    url: 'https://github.com/react-component',
    logo: 'https://avatars3.githubusercontent.com/u/9441414?s=200&v=4'
  },
  {
    name: 'GGEditor',
    url: 'https://ggeditor.com"',
    logo: 'https://img.alicdn.com/tfs/TB1FFA1CFP7gK0jSZFjXXc5aXXa-214-200.png'
  },
  {
    name: 'Remax',
    url: 'https://remaxjs.org',
    logo: 'https://gw.alipayobjects.com/mdn/rms_b5fcc5/afts/img/A*1NHAQYduQiQAAAAAAAAAAABkARQnAQ'
  },
  {
    name: 'LightProxy',
    url: 'https://lightproxy.org',
    logo: 'https://user-images.githubusercontent.com/5436704/81533849-83e00f00-9399-11ea-943d-ac5fd4653906.png'
  },
  {
    name: 'juejin-im',
    url: 'https://juejin-im.github.io/open-source/',
    logo: 'https://avatars3.githubusercontent.com/u/69633008?s=200&v=4'
  },
  {
    name: 'issues-helper',
    url: 'https://actions-cool.github.io/issues-helper/',
    logo: 'https://avatars1.githubusercontent.com/u/73879334?s=200&v=4'
  },
];

users.sort((a, b) => a.name.localeCompare(b.name));

// **************************************************************************

let table = '';
let row = users.length / 5;
let lastNo = users.length % 5;
if (lastNo != 0) row += 1;
for (let j = 1; j <= row; j++) {
  let data = '';
  data = `<tr>
<td width="160" align="center">${getShow(users[(j-1)*5])}</td>
<td width="160" align="center">${getShow(users[(j-1)*5+1])}</td>
<td width="160" align="center">${getShow(users[(j-1)*5+2])}</td>
<td width="160" align="center">${getShow(users[(j-1)*5+3])}</td>
<td width="160" align="center">${getShow(users[(j-1)*5+4])}</td>
</tr>`;
  table += data
};

table = `<table>
${table}
</table>

`;

// **************************************************************************

const pointBefore = '<table>';
const pointAfter = '### README Badge';

const readme = readFileSync('./packages/dumi/README.md', 'utf8');
const beforeIndex = readme.indexOf(pointBefore);
const afterIndex = readme.indexOf(pointAfter);
const readmeBefore = readme.substring(0, beforeIndex);
const readmeAfter = readme.substring(afterIndex, readme.length);

const newReadme = readmeBefore + table + readmeAfter;
writeFileSync('./packages/dumi/README.md', newReadme);
console.log(`🎉 Update readme user done!`);

// **************************************************************************

function getShow (o) {
  if (o) {
    return `
<a target="_blank" href="${o.url}">
  <img src="${o.logo}" height="40" />
  <br />
  <strong>${o.name}</strong>
</a>
`
  }
  return ``
};

// **************************************************************************
