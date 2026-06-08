import type { IRouteMeta, IRoutesById } from './theme-api';

export { Root as HastRoot } from 'hast';
export * from 'umi';
export {
  Plugin as UnifiedPlugin,
  Transformer as UnifiedTransformer,
} from 'unified';
export type {
  IApi,
  IDumiConfig,
  IDumiTechStack,
  IDumiTechStackOnBlockLoadArgs,
  IDumiTechStackOnBlockLoadResult,
  IDumiTechStackRuntimeOpts,
  IDumiUserConfig,
} from './dumi-types';
export * from './theme-api';

export declare enum ApplyPluginsType {
  add = 'add',
  modify = 'modify',
  event = 'event',
  compose = 'compose',
}
export declare class PluginManager {
  static create(opts: Record<string, any>): PluginManager;
  applyPlugins(opts: Record<string, any>): any;
  [key: string]: any;
}

export declare const getSketchJSON: (
  element: Element,
  opts: Record<string, any>,
) => Promise<Record<string, any>>;
export declare const history: {
  location: Location;
  push(to: string | Record<string, any>): void;
  replace(to: string | Record<string, any>): void;
  listen(listener: (...args: any[]) => void): () => void;
  [key: string]: any;
};
export declare const Helmet: any;
export declare const Link: any;
export declare const NavLink: any;
export declare const matchRoutes: (...args: any[]) => any;
export declare const useAppData: () => {
  clientRoutes: any[];
  routes: IRoutesById;
  [key: string]: any;
};
export declare const useLocation: () => Location & Record<string, any>;
export declare const useOutlet: () => any;
export declare const useParams: () => Record<string, string | undefined>;
export declare const useRouteData: () => {
  route: { path?: string; meta?: IRouteMeta; [key: string]: any };
  [key: string]: any;
};
export declare const useSearchParams: () => [
  URLSearchParams,
  (...args: any[]) => void,
];

export declare let unistUtilVisit: typeof import('unist-util-visit');
export declare const getProjectRoot: (cwd: string) => string;
export declare const defineConfig: <
  T extends import('./dumi-types').IDumiUserConfig,
>(
  config: T,
) => T;
