/**
 * 判断是否使用的是 hash 路由
 * @param location 主要为 SSR 下 window 不报错
 */
const isHashRoute = (location: any) => /^(#\/|[^#])/.test(location ? location.hash : window?.location?.hash);

export default isHashRoute;
