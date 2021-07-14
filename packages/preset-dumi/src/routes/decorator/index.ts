import type { IApi, IRoute } from '@umijs/types';
import { createDebug } from '@umijs/utils';
import type { IDumiOpts } from '../..';
import flat from './flat';
import frontMatter from './frontMatter';
import hide from './hide';
import locale from './locale';
import title from './title';
import nav from './nav';
import group from './group';
import fallback from './fallback';
import redirect from './redirect';
import relative from './relative';
import integrate from './integrate';

export type RouteProcessor = (
  this: { options: IDumiOpts; umi: IApi; data: Record<string, any> },
  routes: IRoute[],
) => IRoute[];

class RouteDecorator {
  private processors: RouteProcessor[] = [];

  private options: IDumiOpts;

  private umi: IApi;

  private debug = createDebug('dumi:routes:decorator');

  /**
   * shared storage for all processors
   */
  private data: Record<string, any> = {};

  constructor(options: IDumiOpts, umi: IApi) {
    this.options = options;
    this.umi = umi;
  }

  use(processor: RouteProcessor) {
    this.processors.push(processor);
    return this;
  }

  process(routes: IRoute[]): IRoute[] {
    return this.processors.reduce((result, processor) => {
      const r = processor.call(
        {
          options: this.options,
          umi: this.umi,
          data: this.data,
        },
        result,
      );
      this.debug(processor.name);

      return r;
    }, routes);
  }
}

/**
 * decorator standard umi routes for dumi
 */
export default (routes: IRoute[], opts: IDumiOpts, umi: IApi) => {
  const decorator = new RouteDecorator(opts, umi);

  decorator
    .use(flat)
    .use(frontMatter)
    .use(hide)
    .use(locale)
    .use(nav)
    .use(group)
    .use(title)
    .use(fallback)
    .use(integrate)
    .use(redirect)
    .use(relative);

  return decorator.process(routes);
};
