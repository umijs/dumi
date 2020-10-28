import { IApi } from '@umijs/types';
import { IPropDefinitions } from '../../api-parser';

/**
 * plugin for generate apis.json into .umi temp directory
 */
export default (api: IApi) => {
  const apis: { [key: string]: IPropDefinitions } = {};

  // write all apis into .umi dir
  api.onGenerateFiles(async () => {
    api.writeTmpFile({
      path: 'dumi/apis.json',
      content: JSON.stringify(apis, null, 2),
    });
  });

  // register demo detections
  api.register({
    key: 'dumi.detectApi',
    fn({ identifier, data }) {
      apis[identifier] = data;
    },
  });
};
