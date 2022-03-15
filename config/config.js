export default {
    // TODO: UMI4 
    // ssr: {},
    hash: true,
    // TODO: UMI4 
    // title: 'dumi',
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
    // TODO: UMI4 "[0]" must be one of [string, object]
    // extraBabelPlugins: [
    //     [
    //         require.resolve('babel-plugin-import'),
    //         {
    //             libraryName: 'antd',
    //             libraryDirectory: 'es',
    //             style: 'css',
    //         },
    //     ],
    // ],
    scripts: ['https://v1.cnzz.com/z_stat.php?id=1278653578&web_id=1278653578'],
    // TODO: UMI4 
    // analytics: {
    //     ga: 'UA-128069695-2',
    // },
    styles: ['a[title=站长统计] { display: none; }'],
    // TODO: UMI4 
    // exportStatic: {},
    sitemap: {
        hostname: 'https://d.umijs.org',
    },
};