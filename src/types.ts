/* eslint-disable @typescript-eslint/ban-types */
// import type AtomAssetsParser from '@/assetParsers/atom';
import type { IParsedBlockAsset } from '@/assetParsers/block';
import type { IDumiDemoProps } from '@/client/theme-api/DumiDemo';
import type { ILocalesConfig, IThemeConfig } from '@/client/theme-api/types';
import type { IContentTab } from '@/features/tabs';
import type { IThemeLoadResult } from '@/features/theme/loader';
import {
  OnLoadArgs,
  OnLoadResult,
} from '@umijs/bundler-utils/compiled/esbuild';
import type { IModify } from '@umijs/core';
import type {
  AssetsPackage,
  AtomComponentAsset,
  AtomFunctionAsset,
  ExampleBlockAsset,
} from 'dumi-assets-types';
import type { Element } from 'hast';
import type { IApi as IUmiApi, defineConfig as defineUmiConfig } from 'umi';

// ref: https://grrr.tech/posts/2021/typescript-partial/
type Subset<K> = {
  [attr in keyof K]?: K[attr] extends Array<any>
    ? K[attr]
    : K[attr] extends Function | undefined
    ? K[attr]
    : K[attr] extends object
    ? Subset<K[attr]>
    : K[attr] extends object | null
    ? Subset<K[attr]> | null
    : K[attr] extends object | null | undefined
    ? Subset<K[attr]> | null | undefined
    : K[attr];
};
// ref: https://stackoverflow.com/a/69299668
type NoStringIndex<T> = {
  [K in keyof T as string extends K ? never : K]: T[K];
};

type IUmiConfig = Omit<
  // for exclude [key: string]: any to avoid omit failed
  // ref: https://github.com/microsoft/TypeScript/issues/31153
  NoStringIndex<Parameters<typeof defineUmiConfig>[0]>,
  // omit incomplete types from @@/core/pluginConfig
  'resolve' | 'extraRemarkPlugins' | 'extraRehypePlugins' | 'themeConfig'
>;

interface IDumiExtendsConfig {
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
  /**
   * extra unified plugins
   */
  extraRemarkPlugins?: (string | Function | [string | Function, object])[];
  extraRehypePlugins?: (string | Function | [string | Function, object])[];
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
  /**
   * Available when type is `CANCELABLE`,
   * define the cancelable function as a public function through dumi's plugin mechanism.
   * Users can execute the cancelable function through `applyPlugins`.
   */
  rendererPath?: string;

  pluginPath?: string;

  /**
   * path to runtime compile function module
   */
  compilePath?: string;
}

export abstract class IDumiTechStack {
  /**
   * tech stack name, such as 'react'
   */
  abstract name: string;
  /**
   * used to determine whether to use this tech stack
   */
  abstract isSupported(node: Element, lang: string): boolean;
  /**
   * transform for parse demo source to expression/function/class
   */
  abstract transformCode(
    raw: string,
    opts: { id?: string; type: 'external' | 'code-block'; fileAbsPath: string },
  ): string;

  /**
   * runtime options
   */
  abstract runtimeOpts?: IDumiTechStackRuntimeOpts;

  /**
   * generator for return asset metadata
   */
  abstract generateMetadata?(
    asset: ExampleBlockAsset,
    opts: {
      type: Parameters<IDumiTechStack['transformCode']>[1]['type'];
      mdAbsPath: string;
      fileAbsPath?: string;
      entryPointCode?: string;
    },
  ): Promise<ExampleBlockAsset> | ExampleBlockAsset;
  /**
   * generator for return previewer props
   */
  abstract generatePreviewerProps?(
    props: IDumiDemoProps['previewerProps'],
    opts: Parameters<NonNullable<IDumiTechStack['generateMetadata']>>[1],
  ):
    | Promise<IDumiDemoProps['previewerProps']>
    | IDumiDemoProps['previewerProps'];
  /**
   * generator for return file path of demo source
   */
  abstract generateSources?(
    source: IParsedBlockAsset['resolveMap'],
    opts: Parameters<NonNullable<IDumiTechStack['generateMetadata']>>[1],
  ): Promise<IParsedBlockAsset['resolveMap']> | IParsedBlockAsset['resolveMap'];

  /**
   * Use current function as onLoad CallBack(https://esbuild.github.io/plugins/#on-load)
   * @description
   * Why use this method?
   * By default, dumi can only support the parsing of js/ts related code blocks,
   * but many front-end frameworks have custom extensions,
   * so this method is provided to facilitate developers to convert codes.
   */
  abstract onBlockLoad?(
    args: IDumiTechStackOnBlockLoadArgs,
  ): IDumiTechStackOnBlockLoadResult | null;
}

export interface AtomAssetsParserResult {
  components: Record<string, AtomComponentAsset>;
  functions: Record<string, AtomFunctionAsset>;
}

export abstract class AtomAssetsParser {
  /**
   * parse component metadata
   */
  abstract parse(): Promise<AtomAssetsParserResult>;

  /**
   * monitor documents and codes, update component metadata at any time
   */
  abstract watch(cb: (data: AtomAssetsParserResult) => void): void;

  /**
   * cancel monitoring
   */
  abstract unwatch(cb: (data: AtomAssetsParserResult) => void): void;

  /**
   * cancel parsing
   */
  abstract destroyWorker(): void;
}

export type IApi = IUmiApi & {
  config: IDumiConfig & { [key: string]: any };
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
  /**
   * get assets metadata
   */
  getAssetsMetadata?: () => Promise<AssetsPackage>;
};
