import path from 'path';
import { IApi } from 'umi-types';

export interface IMenuItem {
  /**
   * menu 的路由，仅该 menu 不为 group 时才存在
   */
  path?: string;
  /**
   * group 前缀，仅该 menu 为 group 时才存在
   */
  prefix?: string;
  title: string;
  meta?: { [key: string]: any };
  children?: IMenuItem[];
}

function menuSorter(prev, next) {
  const prevOrder = typeof(prev.meta.order) === 'number' ? prev.meta.order : 0;
  const nextOrder = typeof(next.meta.order) === 'number' ? next.meta.order : 0;

  return (prevOrder === nextOrder) ? 0 : (nextOrder - prevOrder);
}

export default (routes: IApi['routes']) : IMenuItem[] => {
  let menu: IMenuItem[] = [];

  // convert routes to menu
  routes.forEach((route) => {
    if (route.path) {
      menu.push({
        path: route.path,
        title: route.meta.title || path.parse(route.component as string).name,
        meta: route.meta,
      });
    }
  });

  // group by menu frontmatter
  const [ungroup, groupedMapping] = menu.reduce((result, item) => {
    if (item.meta?.group?.title) {
      const key = item.meta.group.title;

      if (result[1][key]) {
        result[1][key].push(item);
      } else {
        result[1][key] = [item];
      }
    } else {
      result[0].push(item);
    }

    return result;
  }, [[], {}]);


  menu = ungroup.concat(
    Object
      .keys(groupedMapping)
      .map(key => ({
        title: key,
        prefix: groupedMapping[key].find(item => item.meta.group.path).meta.group.path,
        children: groupedMapping[key],
        meta: {
          // use child order as group order
          order: groupedMapping[key].find(item => item.meta.group.order)?.meta?.group?.order || undefined,
        },
      }))
  );

  // sort menu
  menu.sort(menuSorter);
  menu.forEach((route) => {
    if (route.children) {
      route.children.sort(menuSorter);
    }
  });

  return menu;
}
