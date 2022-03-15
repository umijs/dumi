import { IApi } from 'umi';
import type { IMarkdwonComponent } from '../../transformer/remark/mdComponent';
import { registerMdComponent } from '../../transformer/remark/mdComponent';

export default (api: IApi) => {
  api.onStart(async () => {
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
