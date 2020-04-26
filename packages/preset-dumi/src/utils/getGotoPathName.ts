import isHashRoute from './isHashRoute';

/**
 * 生成需要跳转的页面
 * hash 路由使用 params
 * 正常路由使用 hash
 * @param pathName
 * @param slug
 */
const getGotoPathName = (pathName: string, slug: string, location = window.location) => {
  const { search } = location;
  const pathArray = [];
  if (isHashRoute(location)) {
    pathArray.push(`?anchor=${slug}`);
    if (search) {
      pathArray.push(`&${search.replace('?', '')}`);
    }
    // 拼接原来的 search 防止丢失
    return pathArray.join('');
  }
  return `${pathName}${search}#${slug}`;
};

export default getGotoPathName;
