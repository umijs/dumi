import { registerPreviewerTransformer } from '../../transformer/remark/previewer';
import type { IApi } from '@umijs/types';
import type { IPreviewerTransformer } from '../../transformer/remark/previewer/builtin';

export interface ICompiletimeOpts {
  /**
   * compiletime name
   */
  name: string;
  /**
   * previewer component absolute path
   */
  component: string;
  /**
   * previewer transformer
   */
  transformer: IPreviewerTransformer['fn'];
}

export default (api: IApi) => {
  // wait for compiletime be registered
  api.onPluginReady(async () => {
    // get registered compiletime
    const compiletimes: ICompiletimeOpts[] = await api.applyPlugins({
      type: api.ApplyPluginsType.add,
      key: 'dumi.registerCompiletime',
      initialValue: [],
    });

    // reverse to make sure order is correct, the registerPreviewerTransformer use unshift() method
    compiletimes.reverse().forEach((opts) => {
      // register transformer
      registerPreviewerTransformer({
        type: opts.name,
        fn: opts.transformer,
        component: opts.component,
      });
    });
  });
};
