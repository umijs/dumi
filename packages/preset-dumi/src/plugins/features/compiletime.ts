import { registerPreviewerTransformer } from '../../transformer/remark/previewer';
import type { IApi } from '@umijs/types';
import type { IPreviewerTransformer } from '../../transformer/remark/previewer/builtin';

interface ICompiletimeOpts {
  /**
   * compiletime name
   * @note  will be used as previewer component name
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
  // register compiletime
  api.register({
    key: 'dumi.registerCompiletime',
    fn(opts: ICompiletimeOpts) {
      // register transformer
      registerPreviewerTransformer({
        type: opts.name,
        fn: opts.transformer,
        component: opts.component,
      });
    },
  });
};
