import { IApi } from '@umijs/types';
import { IMarkdwonComponent, registerMdComponent } from '../../transformer/remark/api';

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
