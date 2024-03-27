const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const UMI_DOC_DIR = path.join(__dirname, '..', 'docs', '.upstream');
const RM_FM_ACTION = {
  type: 'replace',
  value: [/^---[^]+?---\n/, ''],
};

const JSDELIVR_PREFIX = 'https://cdn.jsdelivr.net/gh/umijs/umi@4/';
const GITHUB_RAW_PREFIX = 'https://raw.githubusercontent.com/umijs/umi/master/';

const FILE_LIST = [
  // config docs
  {
    localname: 'config.md',
    repoPath: 'docs/docs/docs/api/config.md',
    actions: [
      RM_FM_ACTION,
      // remove head content
      { type: 'slice', value: [2] },
      // remove unnecessary option
      ...[
        'clientLoader',
        'cssLoaderModules',
        'deadCode',
        'helmet',
        'icons',
        '本地 icon 使用',
        'jsMinifier \\(vite 构建\\)',
        'mdx',
        'mpa',
        'phantomDependency',
        'reactRouter5Compat',
        'vite',
        'verifyCommit',
      ].map((option) => ({
        type: 'replace',
        value: [
          new RegExp(`(?:^|[\\r\\n])## ${option}[^]+?([\\r\\n]## |$)`),
          '$1',
        ],
      })),
      // remove h1
      { type: 'replace', value: [/^#\s[^\r\n]+/, ''] },
      // replace h2 -> h3
      { type: 'replace', value: [/(\n?)##/g, '\n###'] },
      // replace jsx to jsx | pure
      { type: 'replace', value: [/\n```(jsx|tsx)\s*\n/g, '\n```$1 | pure\n'] },
      // prepend internal link prefix
      // { type: 'replace', value: [/]\(\//g, '](https://umijs.org/'] },
      // prepend anchor link prefix
      // { type: 'replace', value: [/]\(#/g, '](https://umijs.org/docs/api/config#'] },
      // replace mfsu eager strategy
      { type: 'replace', value: [" strategy: 'normal' | 'eager';", ''] },
      {
        type: 'replace',
        value: ["{ mfName: 'mf', strategy: 'normal' }", "{ mfName: 'mf' }"],
      },
      { type: 'replace', value: [/- `strategy` 指定[^\n]+\n/, ''] },
      { type: 'replace', value: [/- `include` 仅在 `strategy[^\n]+\n/, ''] },
      // replace hash default
      { type: 'replace', value: [/(# hash[^]+?默认值：)`false`/g, '$1`true`'] },
      // replace esbuildMinifyIIFE default
      {
        type: 'replace',
        value: [/(# esbuildMinifyIIFE[^]+?默认值：)`false`/g, '$1`true`'],
      },
      // replace exportStatic default
      {
        type: 'replace',
        value: [/(# exportStatic[^]+?默认值：)`undefined`/g, '$1`{}`'],
      },
      // replace conventionRoutes default
      {
        type: 'replace',
        value: [
          /(# conventionRoutes[^]+?默认值：)`null`/g,
          "$1`{ base: './.dumi/pages', exclude: [/(\\/|^)(\\.|_\\/)/] }`",
        ],
      },
      // replace metas
      { type: 'replace', value: [/('|")umi, umijs/g, '$1dumi, base on umi'] },
      // replace umi config
      { type: 'replace', value: [/\.umirc/g, '.dumirc'] },
      // replace umi word
      { type: 'replace', value: [/umi 4/gi, 'dumi'] },
      {
        type: 'replace',
        value: [/(额外的|，|。|让|删除|'|`|[^-]\s)umi/gi, '$1dumi'],
      },
      // replace same page url
      {
        type: 'replace',
        value: [/https:\/\/umijs\.org\/docs\/api\/config/g, ''],
      },
      // replace @primary-color to @c-primary (dumi theme variables)
      {
        type: 'replace',
        value: [
          /(theme: { '@primary-color': '#1DA57A' })/,
          `// 修改 dumi 默认主题的主色，更多变量详见：https://github.com/umijs/dumi/blob/master/src/client/theme-default/styles/variables.less\n(theme: { '@c-primary': '#1DA57A' })`,
        ],
      },
      // replace directory structure link
      {
        type: 'replace',
        value: ['guides/directory-structure', 'guide/project-structure'],
      },
      // strip command link
      {
        type: 'replace',
        value: ['[命令行](./commands)', '命令行'],
      },
      // strip runtime config
      {
        type: 'replace',
        value: [/> 关于浏览器端构建需要用到的一些配置[^\r\n]+[\r\n]/, ''],
      },
      // strip vite for analyze
      {
        type: 'replace',
        value: [/使用 Vite 模式时[^\r\n]+[\r\n]/, ''],
      },
      // clear jsMinifier vite
      {
        type: 'replace',
        value: [/{\n\/\*| \(webpack\)/g, ''],
      },
      // replace src/pages to .dumi/pages
      {
        type: 'replace',
        value: [/src\/pages/g, '.dumi/pages'],
      },
      // replace convention routes link
      {
        type: 'replace',
        value: ['guides/routes#约定式路由', 'guide/conventional-routing'],
      },
      // unlink for ANALYZE env
      {
        type: 'replace',
        value: [/\[`ANALYZE`\]\(.+?\)/, '`ANALYZE=1`'],
      },
      // update routes option
      {
        type: 'replace',
        value: [
          /更多信息，请查看 \[配置路由[^\r\n]+/,
          '非推荐用法，暂不提供示例',
        ],
      },
    ],
  },
  {
    localname: 'api.md',
    repoPath: 'docs/docs/docs/api/api.md',
    actions: [
      RM_FM_ACTION,
      // remove head content
      { type: 'slice', value: [6] },
      { type: 'replace', value: ['{\n/*\n', ''] },
      // remove unnecessary option
      ...['dynamic'].map((option) => ({
        type: 'replace',
        value: [new RegExp(`(?:^|[\r\n])### ${option}[^]+?([\r\n]#|$)`), '$1'],
      })),
      // replace umi word
      { type: 'replace', value: [/('|")umi/g, '$1dumi'] },
      // replace jsx to jsx | pure
      { type: 'replace', value: [/\n```(jsx|tsx)\s*\n/g, '\n```$1 | pure\n'] },
      // replace umi statement
      {
        type: 'replace',
        value: [/(在|用)(\s?)umi/gi, '$1$2dumi'],
      },
    ],
  },
  {
    localname: 'plugin.md',
    repoPath: 'docs/docs/docs/guides/plugins.md',
    actions: [
      RM_FM_ACTION,
      // remove head content
      { type: 'slice', value: [1] },
      { type: 'replace', value: ['Umi 的核心就在于它的插件机制。', ''] },
      // remove unnecessary section
      ...['preset-umi'].map((option) => ({
        type: 'replace',
        value: [new RegExp(`(?:^|[\r\n])### ${option}[^]+?([\r\n]#|$)`), '$1'],
      })),
      // replace umi word
      { type: 'replace', value: [/('|")umi/g, '$1dumi'] },
      { type: 'replace', value: [/umi@3/g, 'dumi@1'] },
      { type: 'replace', value: [/Umi(\s|-)/gi, 'dumi$1'] },
      { type: 'replace', value: [/UMI/g, 'DUMI'] },
      // replace plugin api link
      {
        type: 'replace',
        value: [/\/api\/plugin-api/g, '/plugin/api.md'],
      },
    ],
  },
  {
    localname: 'plugin-api.md',
    repoPath: 'docs/docs/docs/api/plugin-api.md',
    actions: [
      RM_FM_ACTION,
      // remove head content
      { type: 'slice', value: [6] },
      // remove unnecessary section
      ...['modifyViteConfig'].map((option) => ({
        type: 'replace',
        value: [new RegExp(`(?:^|[\r\n])### ${option}[^]+?([\r\n]#|$)`), '$1'],
      })),
      // replace umi word
      { type: 'replace', value: [/('|")umi/g, '$1dumi'] },
      { type: 'replace', value: [/umi@3/g, 'dumi@1'] },
      { type: 'replace', value: [/umi@4/g, 'dumi@2'] },
      { type: 'replace', value: [/Umi(\s|-|!)/gi, 'dumi$1'] },
      { type: 'replace', value: [/UMI/g, 'DUMI'] },
      // put embed flag
      { type: 'replace', value: [/(## 核心 API)/, '<!-- core api -->\n\n$1'] },
      {
        type: 'replace',
        value: [
          /(## 扩展方法)/,
          '<!-- core api end -->\n\n<!-- methods -->\n\n$1',
        ],
      },
      {
        type: 'replace',
        value: [/(## 属性)/, '<!-- methods end -->\n\n<!-- props -->\n\n$1'],
      },
      { type: 'replace', value: [/$/, '<!-- props end -->'] },
      // replace plugin api link
      // {
      //   type: 'replace',
      //   value: [/\/api\/plugin-api/g, '/plugin/api'],
      // },
    ],
  },
  {
    localname: 'runtime-config.md',
    repoPath: 'docs/docs/docs/api/runtime-config.md',
    actions: [
      RM_FM_ACTION,
      // replace jsx to jsx | pure
      { type: 'replace', value: [/\n```(jsx|tsx)\s*\n/g, '\n```$1 | pure\n'] },
      // replace umi to dumi
      { type: 'replace', value: [/('|"|\s)umi/g, '$1dumi'] },
      { type: 'replace', value: ['src/app.tsx', '.dumi/app.(js|ts|jsx|tsx)'] },
      // mark runtime config intro
      {
        type: 'replace',
        value: [/(# 运行时配置\s)/, '$1<!-- runtime config intro -->'],
      },
      {
        type: 'replace',
        value: [/(\s## 配置项)/, '<!-- runtime config intro end -->$1'],
      },
      // mark runtime config core
      {
        type: 'replace',
        value: [/(\s### onRouteChange)/, '<!-- runtime config core -->$1'],
      },
      {
        type: 'replace',
        value: [/(\s### qiankun)/, '\n<!-- runtime config core end -->$1'],
      },
      // remove useless line break
      {
        type: 'replace',
        value: ['\n- `routeComponents`', '- `routeComponents`'],
      },
      // replace @/extraRoutes to ./extraRoutes
      { type: 'replace', value: [/@(\/extraRoutes)/g, '.$1'] },
      // remove args from title
      { type: 'replace', value: [/(#+\s\w+)\([^)]+\)/g, '$1'] },
      // remove HashAnchorCompat
      // ref: https://github.com/umijs/umi/blob/8bfd4c761b3cc6209b9203c705842568c3ccbe62/docs/docs/docs/api/runtime-config.md#L183
      {
        type: 'replace',
        value: [/<HashAnchorCompat.+?<\/HashAnchorCompat>\n/g, ''],
      },
    ],
  },
  {
    localname: 'env-config.md',
    repoPath: 'docs/docs/docs/guides/env-variables.md',
    actions: [
      RM_FM_ACTION,
      // remove head content
      { type: 'slice', value: [1] },
      // remove unnecessary section
      ...['DID_YOU_KNOW'].map((option) => ({
        type: 'replace',
        value: [new RegExp(`(?:^|[\r\n])### ${option}[^]+?([\r\n]#|$)`), '$1'],
      })),
      // replace umi to dumi
      { type: 'replace', value: [/UMI/g, 'DUMI'] },
      { type: 'replace', value: [/('|"|\s|`|&)umi/gi, '$1dumi'] },
      // replace BABEL_CACHE to DUMI_CACHE
      { type: 'replace', value: [/BABEL_CACHE/g, 'DUMI_CACHE'] },
      { type: 'replace', value: [/\sbabel\s/g, ' dumi '] },
      // replace config to .dumirc
      { type: 'replace', value: [/config\./g, '.dumirc.'] },
    ],
  },
].map((file) => {
  const urlPrefix = [
    // 可以完全自定义(也许是一个本地启动的服务) `SYNC_CUSTOM_UPSTREAM=http://127.0.0.1:8080/ npm run docs:sync`
    process.env.SYNC_CUSTOM_UPSTREAM,
    // 同步遇到 443 失败时, 可以尝试 `SYNC_USE_GITHUB=1 npm run docs:sync` 使用 GitHub 作为源
    process.env.SYNC_USE_GITHUB && GITHUB_RAW_PREFIX,
    JSDELIVR_PREFIX,
  ].find(Boolean);
  return { ...file, upstream: `${urlPrefix}${file.repoPath}` };
});

if (!fs.existsSync(UMI_DOC_DIR)) {
  fs.mkdirSync(UMI_DOC_DIR);
}

// process files
FILE_LIST.forEach((file) => {
  const localPath = path.join(UMI_DOC_DIR, file.localname);

  const protocol = file.upstream.startsWith('https') ? https : http;

  // get file from upstream
  protocol.get(file.upstream, (res) => {
    let content = '';

    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      content += chunk;
    });
    res.on('end', () => {
      // execute process actions
      (file.actions || []).forEach((action) => {
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
      console.log(
        `🔁 ${file.upstream} -> ${path.relative(process.cwd(), localPath)} [${(
          content.length / 1024
        ).toFixed(2)}KB]`,
      );
    });
  });
});
