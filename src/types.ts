import { IApi as IUmiApi } from 'umi';

type IUmiConfig = IUmiApi['config'];

export interface IDumiConfig extends IUmiConfig {
  resolve: {
    docDirs: string[];
  };
}

export type IApi = IUmiApi & {
  config: IDumiConfig;
  userConfig: IDumiConfig;
};
