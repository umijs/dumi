import { useOutlet } from 'dumi';
import React from 'react';
// import { lazyMeta } from '../../tmp/dumi/meta/lazy';
// import { getDemoById } from '../../tmp/dumi/meta/demos';

export interface GlobalLayoutProps {
  children?: React.ReactNode;
}

// console.log(
//   'getDemoById:',
//   getDemoById('foo-demo-0').then((ret) => {
//     console.log('Demo:', ret);
//   }),
// );

export default function GlobalLayout({ children }: GlobalLayoutProps) {
  // console.log('site:', useSiteData());
  // console.log('route:', useRouteMeta());
  // const { route } = useRouteData();

  // console.log('~'.repeat(20));
  // console.log('useRouteMeta:', useRouteMeta());
  // console.log('useAppData:', useAppData());
  // console.log('useLocation:', useLocation());
  // console.log('useRouteData:', useRouteData());
  // const { id } = useRouteMeta();

  // React.useEffect(() => {
  //   lazyMeta(id).then((data) => {
  //     console.log('Lazy Data:', data);
  //   });
  // }, []);

  const outlet = useOutlet();

  return outlet;
}
