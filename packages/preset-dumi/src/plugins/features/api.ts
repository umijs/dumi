import type { IApi } from '@umijs/types';
import type { IApiDefinition } from '../../api-parser';
import { setOptions } from '../../context';

/**
 * plugin for generate apis.json into .umi temp directory
 */
export default (api: IApi) => {
  const apis: Record<string, IApiDefinition> = {};
  const generateApisFile = () => {
    api.writeTmpFile({
      path: 'dumi/apis.json',
      content: JSON.stringify(apis, null, 2),
    });
  };

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

  api.describe({
    key: 'apiParser',
    config: {
      schema(joi) {
        return joi.object();
      },
      default: {},
      onChange: api.ConfigChangeType.regenerateTmpFiles,
    },
  });

  // share config with other source module via context
  api.modifyConfig(memo => {
    setOptions('apiParser', memo.apiParser);

    return memo;
  });
};
