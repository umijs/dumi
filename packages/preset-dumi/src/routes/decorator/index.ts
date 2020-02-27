import { IApi, IRoute } from '@umijs/types';
import { IDumiOpts } from '../..';
import flat from './flat';
import frontMatter from './frontMatter';
import locale from './locale';
import title from './title';
import nav from './nav';
import group from './group';
import fallback from './fallback';
import redirect from './redirect';
import relative from './relative';

export type RouteProcessor = (
  this: { options: IDumiOpts; umi: IApi; data: { [key: string]: any } },
  routes: IRoute[],
) => IRoute[];

class RouteDecorator {
  private processors: RouteProcessor[] = [];

  private options: IDumiOpts;

  private umi: IApi;

  /**
   * shared storage for all processors
   */
  private data: { [key: string]: any } = {};

  constructor(options: IDumiOpts, umi: IApi) {
    this.options = options;
    this.umi = umi;
  }

  use(processor: RouteProcessor) {
    this.processors.push(processor);
    return this;
  }

  process(routes: IRoute[]): IRoute[] {
    return this.processors.reduce(
      (result, processor) =>
        processor.call(
          {
            options: this.options,
            umi: this.umi,
            data: this.data,
          },
          result,
        ),
      routes,
    );
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
    .use(locale)
    .use(title)
    .use(nav)
    .use(group)
    .use(fallback)
    .use(redirect)
    .use(relative);

  return decorator.process(routes);
};
