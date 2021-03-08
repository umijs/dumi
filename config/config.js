export default {
  ssr: {},
  hash: true,
  title: 'dumi',
  mode: 'site',
  favicon: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
  navs: {
    'en-US': [
      null,
      { title: 'GitHub', path: 'https://github.com/umijs/dumi' },
      { title: 'Changelog', path: 'https://github.com/umijs/dumi/releases' },
    ],
    'zh-CN': [
      null,
      { title: 'GitHub', path: 'https://github.com/umijs/dumi' },
      { title: '更新日志', path: 'https://github.com/umijs/dumi/releases' },
    ],
  },
  extraBabelPlugins: [
    [
      'import',
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: 'css',
      },
    ],
  ],
  scripts: ['https://v1.cnzz.com/z_stat.php?id=1278653578&web_id=1278653578'],
  analytics: {
    ga: 'UA-128069695-2',
  },
  styles: ['a[title=站长统计] { display: none; }'],
  exportStatic: {},
  sitemap: {
    hostname: 'https://d.umijs.org',
  },
  hire: {
    title: '蚂蚁体验技术部正寻觅前端',
    content: `
<p><strong>招聘团队：</strong>蚂蚁体验技术部（玉伯）- 平台前端技术部（偏右）</p>
<p><strong>招聘层级：</strong>P5 ~ P8</p>
<p><strong>\u3000技术栈：</strong>不限</p>
<p><strong>工作城市：</strong>杭州、上海、成都</p>
<p><strong>面试效率：</strong>一周面完</p>
<p><strong>团队作品：</strong></p>
<ul>
  <li>Ant Design · 西湖区最流行的设计语言</li>
  <li>Umi · 企业级前端开发框架</li>
  <li>dumi · React 组件研发工具</li>
  <li>qiankun · 微前端泰斗</li>
  <li>ahooks · React Hooks 库</li>
</ul>`,
    email: 'shengtao.xst@antgroup.com',
    slogan: '在寻找心仪的工作吗？',
  }
};
