import type {
  OnLoadArgs,
  OnLoadResult,
} from '@umijs/bundler-utils/compiled/esbuild';
import type { IModify } from '@umijs/core';
import type { AssetsPackage, ExampleBlockAsset } from 'dumi-assets-types';
import type { Element } from 'hast';
import type { IApi as IUmiApi, defineConfig as defineUmiConfig } from 'umi';
import type { IDumiDemoProps, ILocalesConfig, IThemeConfig } from './theme-api';

type Subset<K> = {
  [attr in keyof K]?: K[attr] extends Array<any>
    ? K[attr]
    : K[attr] extends (...args: any[]) => any | undefined
    ? K[attr]
    : K[attr] extends object
    ? Subset<K[attr]>
    : K[attr] extends object | null
    ? Subset<K[attr]> | null
    : K[attr] extends object | null | undefined
    ? Subset<K[attr]> | null | undefined
    : K[attr];
};
type NoStringIndex<T> = {
  [K in keyof T as string extends K ? never : K]: T[K];
};
type IUmiConfig = Omit<
  NoStringIndex<Parameters<typeof defineUmiConfig>[0]>,
  'resolve' | 'extraRemarkPlugins' | 'extraRehypePlugins' | 'themeConfig'
>;
type UnifiedPluginConfig =
  | string
  | ((...args: any[]) => any)
  | [string | ((...args: any[]) => any), object];

export interface IDumiExtendsConfig {
  resolve: {
    docDirs: (string | { type?: string; dir: string })[];
    atomDirs: { type: string; subType?: string; dir: string }[];
    codeBlockMode: 'active' | 'passive';
    entryFile?: string;
    forceKebabCaseRouting: boolean;
  };
  locales: ILocalesConfig;
  themeConfig: IThemeConfig;
  autoAlias?: boolean;
  extraRemarkPlugins?: UnifiedPluginConfig[];
  extraRehypePlugins?: UnifiedPluginConfig[];
}

export type IDumiConfig = Omit<IUmiConfig, 'locales'> & IDumiExtendsConfig;
export type IDumiUserConfig = Subset<Omit<IDumiConfig, 'locales'>> & {
  locales?:
    | Exclude<IDumiConfig['locales'][0], { base: string }>[]
    | Omit<Exclude<IDumiConfig['locales'][0], { suffix: string }>, 'base'>[];
  [key: string]: any;
};
export interface IDumiTechStackOnBlockLoadResult {
  content: string;
  type: Required<OnLoadResult>['loader'];
}
export type IDumiTechStackOnBlockLoadArgs = OnLoadArgs & {
  entryPointCode: string;
  filename: string;
};
export interface IDumiTechStackRuntimeOpts {
  preflightPath?: string;
  rendererPath?: string;
  compilePath?: string;
  pluginPath?: string;
}
export abstract class IDumiTechStack {
  abstract name: string;
  abstract runtimeOpts?: IDumiTechStackRuntimeOpts;
  abstract isSupported(node: Element, lang: string): boolean;
  abstract transformCode(
    raw: string,
    opts: { type: 'external' | 'code-block'; fileAbsPath: string },
  ): string;
  abstract generateMetadata?(
    asset: ExampleBlockAsset,
    opts: {
      type: Parameters<IDumiTechStack['transformCode']>[1]['type'];
      mdAbsPath: string;
      fileAbsPath?: string;
      entryPointCode?: string;
    },
  ): Promise<ExampleBlockAsset> | ExampleBlockAsset;
  abstract generatePreviewerProps?(
    props: IDumiDemoProps['previewerProps'],
    opts: Parameters<NonNullable<IDumiTechStack['generateMetadata']>>[1],
  ):
    | Promise<IDumiDemoProps['previewerProps']>
    | IDumiDemoProps['previewerProps'];
  abstract generateSources?(
    source: Record<string, string>,
    opts: Parameters<NonNullable<IDumiTechStack['generateMetadata']>>[1],
  ): Promise<Record<string, string>> | Record<string, string>;
  abstract onBlockLoad?(
    args: IDumiTechStackOnBlockLoadArgs,
  ): IDumiTechStackOnBlockLoadResult | null;
}
export type IApi = IUmiApi & {
  config: IDumiConfig & { [key: string]: any };
  userConfig: IDumiUserConfig;
  service: IUmiApi['service'] & {
    themeData: any;
    atomParser: any;
  };
  registerTechStack: (fn: () => IDumiTechStack) => void;
  modifyTheme: IModify<any, null>;
  addContentTab: (fn: () => any) => void;
  modifyAssetsMetadata: IModify<AssetsPackage, null>;
  getAssetsMetadata?: () => Promise<AssetsPackage>;
};
