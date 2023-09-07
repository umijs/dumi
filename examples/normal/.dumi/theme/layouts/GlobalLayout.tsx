import {
  useOutlet,
  // useRouteData,
  useRouteMeta,
} from 'dumi';
import React from 'react';
import { lazyMeta } from '../../tmp/dumi/meta/lazy';

export interface GlobalLayoutProps {
  children?: React.ReactNode;
}

export default function GlobalLayout({ children }: GlobalLayoutProps) {
  // console.log('site:', useSiteData());
  // console.log('route:', useRouteMeta());
  // const { route } = useRouteData();

  // console.log('~'.repeat(20));
  // console.log('useRouteMeta:', useRouteMeta());
  // console.log('useAppData:', useAppData());
  // console.log('useLocation:', useLocation());
  // console.log('useRouteData:', useRouteData());
  const { id } = useRouteMeta();

  React.useEffect(() => {
    lazyMeta(id).then((data) => {
      console.log('Lazy Data:', data);
    });
  }, []);

  const outlet = useOutlet();

  return outlet;
}
