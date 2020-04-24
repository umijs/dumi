/**
 * 判断是否使用的是 hash 路由
 */
const isHashRoute = () => /^(#\/|[^#])/.test(typeof window !== 'undefined' && window.location.hash);

export default isHashRoute;
