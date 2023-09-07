import { useRouteData } from 'dumi';

// Customize Page for dumi test
export default () => {
  const { route } = useRouteData();

  // React.useEffect(() => {
  //   lazyMeta('components/Foo/index').then((data) => {
  //     console.log('Data:', data);
  //   });
  // }, []);

  // console.log('useRouteMeta:', useRouteMeta());
  // console.log('useAppData:', useAppData());
  // console.log('useLocation:', useLocation());
  // console.log('useRouteData:', useRouteData());

  return 'Customize Dumi Test Page';
};
