import { useLocation } from 'dumi';
import Loading from 'dumi/theme-default/slots/Loading';
import React from 'react';

const internalDemos = {
  // @ts-ignore
  test: React.lazy(() => import('../theme/internal/test')),
};

function InternalPage() {
  const { search } = useLocation();

  const searchParams = React.useMemo(
    () => new URLSearchParams(search),
    [search],
  );

  if (searchParams.has('debug')) {
    console.log('[dumi:internal]', {
      internalDemos,
    });
  }

  const demo = React.useMemo(() => {
    const debug = searchParams.get('debug') || '';

    return Object.entries(internalDemos).reduce((acc, [key, value]) => {
      if (debug.includes(key)) {
        acc.push(value);
      }
      return acc;
    }, [] as React.LazyExoticComponent<any>[]);
  }, [searchParams]);

  if (demo.length === 0) {
    return (
      <div hidden>
        <h1>Internal Demos</h1>
        <p>
          No internal demos found. Please add the demo name to the URL
          parameters, e.g. ?debug=test.
        </p>
      </div>
    );
  }
  return (
    <React.Suspense fallback={<Loading />}>
      {demo.map((Comp, index) => (
        <React.Fragment key={index}>
          <Comp />
          <hr />
        </React.Fragment>
      ))}
    </React.Suspense>
  );
}

export default InternalPage;
