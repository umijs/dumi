import type AtomAssetsParser from '@/assetParsers/atom';
import type { IDumiDemoProps } from '@/client/theme-api/DumiDemo';
import type { ILocalesConfig, IThemeConfig } from '@/client/theme-api/types';
import type { IContentTab } from '@/features/tabs';
import type { IThemeLoadResult } from '@/features/theme/loader';
import type { IModify } from '@umijs/core';
import type { AssetsPackage, ExampleBlockAsset } from 'dumi-assets-types';
import type { Element } from 'hast';
import type { IApi as IUmiApi } from 'umi';

type IUmiConfig = IUmiApi['config'];

export interface IDumiConfig extends IUmiConfig {
  resolve: {
    docDirs: (string | { type?: string; dir: string })[];
    /**
     * @deprecated use `resolve.atomDirs` instead
     */
    entityDirs?: { type: string; dir: string }[];
    atomDirs: { type: string; dir: string }[];
    codeBlockMode: 'active' | 'passive';
    entryFile?: string;
  };
  locales: ILocalesConfig;
  themeConfig: IThemeConfig;
  autoAlias?: boolean;
  /**
   * extra unified plugins
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  extraRemarkPlugins?: (string | Function | [string | Function, object])[];
  // eslint-disable-next-line @typescript-eslint/ban-types
  extraRehypePlugins?: (string | Function | [string | Function, object])[];
}

export interface IDumiUserConfig
  extends Partial<Omit<IDumiConfig, 'resolve' | 'locales'>> {
  resolve?: Partial<IDumiConfig['resolve']>;
  locales?: (
    | IDumiConfig['locales'][0]
    | Omit<IDumiConfig['locales'][0], 'base'>
  )[];
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
   * generator for return asset metadata
   */
  abstract generateMetadata?(
    asset: ExampleBlockAsset,
  ): Promise<ExampleBlockAsset> | ExampleBlockAsset;
  /**
   * generator for return previewer props
   */
  abstract generatePreviewerProps?(
    props: IDumiDemoProps['previewerProps'],
    opts: {
      type: Parameters<IDumiTechStack['transformCode']>[1]['type'];
      mdAbsPath: string;
      fileAbsPath?: string;
      entryPointCode?: string;
    },
  ):
    | Promise<IDumiDemoProps['previewerProps']>
    | IDumiDemoProps['previewerProps'];
}

export type IApi = IUmiApi & {
  config: IDumiConfig;
  userConfig: IDumiUserConfig;
  service: IUmiApi['service'] & {
    themeData: IThemeLoadResult;
    atomParser: AtomAssetsParser;
  };
  /**
   * register a new tech stack
   */
  registerTechStack: (fn: () => IDumiTechStack) => void;
  /**
   * modify original theme data
   */
  modifyTheme: IModify<IThemeLoadResult, null>;
  /**
   * add content tab
   */
  addContentTab: (fn: () => IContentTab) => void;
  /**
   * modify assets metadata
   */
  modifyAssetsMetadata: IModify<AssetsPackage, null>;
};
