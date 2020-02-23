/**
 * 判断是否使用的是 hash 路由
 */
const isHashRoute = () => /^(#\/|[^#])/.test(window.location.hash);

export default isHashRoute;
