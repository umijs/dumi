import type { Element } from 'hast';
import type { IApi as IUmiApi } from 'umi';

type IUmiConfig = IUmiApi['config'];

export interface IDumiConfig extends IUmiConfig {
  resolve: {
    docDirs: string[];
    entityDirs: { type: string; dir: string }[];
  };
}

export abstract class IDumiTechStack {
  /**
   * tech stack name, such as 'react'
   */
  abstract name: string;
  /**
   * transform code
   */
  abstract isSupported(node: Element, lang: string): boolean;
  /**
   * transform for parse demo source to react component
   */
  abstract transformCode(
    raw: string,
    opts: { type: 'external' | 'code-block'; fileAbsPath: string },
  ): string;
  /**
   * generator for return assets meta data
   * TODO: real assets meta data types
   */
  abstract generateMetadata?(): any;
  /**
   * generator for return previewer props
   */
  abstract generatePreviewerProps?(): Record<string, any>;
}

export type IApi = IUmiApi & {
  config: IDumiConfig;
  userConfig: IDumiConfig;
  /**
   * register a new tech stack
   */
  registerTechStack: (fn: () => IDumiTechStack) => void;
};
