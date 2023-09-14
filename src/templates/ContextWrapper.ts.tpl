import React, { useState, useEffect, useRef } from 'react';
import { useOutlet, history } from 'dumi';
import { warning } from 'rc-util';
import { SiteContext, type ISiteContext } from '{{{contextPath}}}';
import { components } from '../meta/atoms';
import { tabs } from '../meta/tabs';
import { getDemoById } from '../meta/demos';
import { locales } from '../locales/config';
{{{defaultExport}}}
{{{namedExport}}}

const entryExports = {
  {{#hasDefaultExport}}
    default: entryDefaultExport,
  {{/hasDefaultExport}}
  {{#hasNamedExport}}
    ...entryMemberExports,
  {{/hasNamedExport}}
};

// Static content
const pkg = {{{pkg}}};
const historyType = "{{{historyType}}}";
const hostname = {{{hostname}}};
const themeConfig = {{{themeConfig}}};
const _2_level_nav_available = {{{_2_level_nav_available}}};

export default function DumiContextWrapper() {
  const outlet = useOutlet();
  const [loading, setLoading] = useState(false);
  const prev = useRef(history.location.pathname);

  useEffect(() => {
    return history.listen((next) => {
      if (next.location.pathname !== prev.current) {
        prev.current = next.location.pathname;

        // scroll to top when route changed
        document.documentElement.scrollTo(0, 0);
      }
    });
  }, []);

  const context: ISiteContext = React.useMemo(() => {
    const ctx = {
      pkg,
      historyType,
      entryExports,
      demos: null,
      components,
      tabs,
      locales,
      loading,
      setLoading,
      hostname,
      themeConfig,
      _2_level_nav_available,
      getDemoById,
    };

    // Proxy do not warning since `Object.keys` will get nothing to loop
    Object.defineProperty(ctx, 'demos', {
      get: () => {
        warning(false, '`demos` return empty in latest version.');
        return {};
      },
    });

    return ctx;
  }, [
    pkg,
    historyType,
    entryExports,
    components,
    tabs,
    locales,
    loading,
    setLoading,
    hostname,
    themeConfig,
    _2_level_nav_available,
    getDemoById,
  ]);



  return (
    <SiteContext.Provider value={context}>
      {outlet}
    </SiteContext.Provider>
  );
}