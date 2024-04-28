export const LOCAL_DUMI_DIR = '.dumi';

export const LOCAL_THEME_DIR = `${LOCAL_DUMI_DIR}/theme`;

export const LOCAL_PAGES_DIR = `${LOCAL_DUMI_DIR}/pages`;

export const THEME_PREFIX = 'dumi-theme-';

export const SP_ROUTE_PREFIX = '~';

export const PREFERS_COLOR_ATTR = 'data-prefers-color';

export const PREFERS_COLOR_LS_KEY = 'dumi:prefers-color';

export const PICKED_PKG_FIELDS = {
  name: '',
  description: '',
  version: '',
  license: '',
  repository: '',
  author: '',
  authors: '',
};

export const USELESS_TMP_FILES = ['tsconfig.json', 'typings.d.ts'];

export const VERSION_2_LEVEL_NAV = '^2.2.0';

export const VERSION_2_DEPRECATE_SOFT_BREAKS = '^2.2.0';

export const DEFAULT_DEMO_MODULE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

export const DEFAULT_DEMO_PLAIN_TEXT_EXTENSIONS = [
  '.css',
  '.less',
  '.sass',
  '.scss',
  '.styl',
  '.json',
];

export const FS_CACHE_DIR = 'node_modules/.cache/dumi';

export const SHOULD_SKIP_LIVEDEMO_ERROR = [
  'Unable to find node on an unmounted component',
  '#188',
  'Portals are not currently supported by the server renderer',
  '#257',
];
