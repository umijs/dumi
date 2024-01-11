import type { IDumiTechStackRuntimeOptions } from 'dumi';

export const VUE_RENDERER_KEY = 'renderVueComponent';
export const LOAD_COMPILER = 'loadCompiler';

export const VueRuntimeOptions: IDumiTechStackRuntimeOptions = {
  renderType: 'CANCELABLE',
  plugin: {
    render: VUE_RENDERER_KEY,
    loadCompiler: LOAD_COMPILER,
  },
};
