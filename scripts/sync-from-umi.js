const fs = require('fs');
const path = require('path');
const https = require('https');

const UMI_DOC_DIR = path.join(__dirname, '..', 'docs', '.upstream');
const FILE_LIST = [
  // config docs
  {
    localname: 'config.md',
    upstream: 'https://cdn.jsdelivr.net/gh/umijs/umi@3/docs/config/README.md',
    actions: [
      // remove head content
      { type: 'slice', value: [13] },
      // remove unnecessary option
      ...['title', 'singular', 'routes', 'mpa', 'mountElementId'].map(option => ({
        type: 'replace',
        value: [new RegExp(`(?:^|[\r\n])## ${option}[^]+?([\r\n]#|$)`), '$1'],
      })),
      // replace h2 -> h3
      { type: 'replace', value: [/(\n?)##/g, '\n###'] },
      // replace jsx to jsx | pure
      { type: 'replace', value: [/\n```(jsx|tsx)\s*\n/g, '\n```$1 | pure\n'] },
      // remove badges
      { type: 'replace', value: [/\s*<Badge>[^]+?<\/Badge>/g, ''] },
      // prepend internal link prefix
      { type: 'replace', value: [/]\(\//g, '](https://umijs.org/'] },
      // prepend anchor link prefix
      { type: 'replace', value: [/]\(#/g, '](https://umijs.org/zh-CN/config#'] },
    ],
  },
];

if (!fs.existsSync(UMI_DOC_DIR)) {
  fs.mkdirSync(UMI_DOC_DIR);
}

// process files
FILE_LIST.forEach(file => {
  const localPath = path.join(UMI_DOC_DIR, file.localname);

  // get file from upstream
  https.get(file.upstream, res => {
    let content = '';

    res.setEncoding('utf8');
    res.on('data', chunk => {
      content += chunk;
    });
    res.on('end', () => {
      // execute process actions
      (file.actions || []).forEach(action => {
        switch (action.type) {
          case 'slice':
            content = content
              .split(/\n/g)
              .slice(action.value[0], action.value[1])
              .join('\n');
            break;

          case 'replace':
            content = content.replace(action.value[0], action.value[1]);
            break;

          default:
        }
      });

      // write back to file
      fs.writeFileSync(localPath, content);
      console.log('sync', file.localname, 'from upstream successfully!');
    });
  });
});
