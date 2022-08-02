import { IApi } from '@umijs/types';
import type { IMarkdwonComponent } from '../../transformer/remark/mdComponent';
import { registerMdComponent } from '../../transformer/remark/mdComponent';

export default (api: IApi) => {
  api.onPluginReady(async () => {
    const mdComponents: IMarkdwonComponent[] = await api.applyPlugins({
      type: api.ApplyPluginsType.add,
      key: 'dumi.registerMdComponent',
      initialValue: [],
    });

    mdComponents.forEach(comp => {
      registerMdComponent(comp);
    });
  });
};
