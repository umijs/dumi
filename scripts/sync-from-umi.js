const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const UMI_DOC_DIR = path.join(__dirname, '..', 'docs', '.upstream');
const FILE_LIST = [
  // config docs
  {
    localname: 'config.md',
    upstream: 'raw.githubusercontent.com/umijs/umi/master/docs/config/README.md',
    actions: [
      // remove head content
      { type: 'slice', value: [13] },
      // replace h2 -> h3
      { type: 'replace', value: [/^\n## /g, '\n### '] },
      // replace jsx to jsx | pure
      { type: 'replace', value: [/\n```(jsx|tsx)\s*\n/g, '\n```$1 | pure\n'] },
      // remove badges
      { type: 'replace', value: [/\s*<Badge>[^]+?<\/Badge>/g, ''] },
      // prepend internal link prefix
      { type: 'replace', value: [/]\(\//g, '](https://umijs.org/'] },
      // prepend anchor link prefix
      { type: 'replace', value: [/]\(#/g, '](https://umijs.org/zh-CN/config#'] },
      // remove unnecessary option
      ...['title', 'singular', 'routes', 'mpa', 'mountElementId'].map(option => ({
        type: 'replace',
        value: [new RegExp(`(?:^|[\r\n])## ${option}[^]+?([\r\n]#|$)`), '$1'],
      })),
    ],
  },
];

// process files
FILE_LIST.forEach(file => {
  const localPath = path.join(UMI_DOC_DIR, file.localname);

  // pull files
  execSync(`curl -o ${file.localname} -L ${file.upstream}`, { cwd: UMI_DOC_DIR, stdio: 'inherit' });

  // execute process actions
  let content = fs.readFileSync(localPath).toString();

  (file.actions || []).forEach(action => {
    switch (action.type) {
      case 'slice':
        content = content.split(/\n/g).slice(action.value[0], action.value[1]).join('\n');
        break;

      case 'replace':
        content = content.replace(action.value[0], action.value[1]);
        break;

      default:
    }
  });

  // write back to file
  fs.writeFileSync(localPath, content);
});
