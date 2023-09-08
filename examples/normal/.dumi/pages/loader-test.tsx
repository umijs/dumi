import { useRouteData } from 'dumi';
import * as demo from '../../docs/index.md?type=demo';
import * as demoIndex from '../../docs/index.md?type=demo-index';
import * as frontmatter from '../../docs/index.md?type=frontmatter';
import * as text from '../../docs/index.md?type=text';

console.log('frontmatter', frontmatter);
console.log('demo', demo);
console.log('demoIndex', demoIndex);
console.log('text', text);

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
