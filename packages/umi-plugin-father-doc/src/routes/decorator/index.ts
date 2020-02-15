import { IApi, IRoute } from 'umi-types';
import { IFatherDocOpts } from '../..';
import flat from './flat';
import frontMatter from './frontMatter';
import locale from './locale';
import group from './group';
import title from './title';
import fallback from './fallback';
import redirect from './redirect';

export type RouteProcessor = (
  this: { options: IFatherDocOpts; umi: IApi; data: { [key: string]: any } },
  routes: IRoute[],
) => IRoute[];

class RouteDecorator {
  private processors: RouteProcessor[] = [];
  private options: IFatherDocOpts;
  private umi: IApi;
  /**
   * shared storage for all processors
   */
  private data: { [key: string]: any } = {};

  constructor(options: IFatherDocOpts, umi: IApi) {
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

export default (routes: IRoute[], opts: IFatherDocOpts, umi: IApi) => {
  const decorator = new RouteDecorator(opts, umi);

  decorator
    .use(flat)
    .use(frontMatter)
    .use(locale)
    .use(group)
    .use(title)
    .use(fallback)
    .use(redirect);

  return decorator.process(routes);
};
