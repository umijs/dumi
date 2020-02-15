import deepmerge from 'deepmerge';
import { RouteProcessor } from '.';
import getFrontMatter from '../getFrontMatter';

/**
 * read frontmatters from route component content
 */
export default (routes =>
  routes.map(route => {
    const frontMatter = typeof route.component === 'string' ? getFrontMatter(route.component) : {};

    return {
      ...route,
      meta: deepmerge(
        frontMatter,
        route.meta || {}, // allow user override meta via configuration routes
      ),
    };
  })) as RouteProcessor;
