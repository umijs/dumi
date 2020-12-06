import { IApi } from '@umijs/types';
import { IApiDefinition } from '../../api-parser';

/**
 * plugin for generate apis.json into .umi temp directory
 */
export default (api: IApi) => {
  const apis: { [key: string]: IApiDefinition } = {};
  const generateApisFile = () => {
    api.writeTmpFile({
      path: 'dumi/apis.json',
      content: JSON.stringify(apis, null, 2),
    });
  }

  // write all apis into .umi dir
  api.onGenerateFiles(() => {
    generateApisFile();
  });

  // register demo detections
  api.register({
    key: 'dumi.detectApi',
    fn({ identifier, data }) {
      const isUpdated = Boolean(apis[identifier]);

      apis[identifier] = data;

      if (isUpdated) {
        generateApisFile();
      }
    },
  });
};
