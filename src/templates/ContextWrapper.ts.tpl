import React, { useState, useEffect, useRef } from 'react';
import { useOutlet, history } from 'dumi';
import { SiteContext } from '{{{contextPath}}}';
import { demos, components } from '../meta';
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

  const context = {
    pkg: {{{pkg}}},
    historyType: "{{{historyType}}}",
    entryExports,
    demos,
    components,
    locales,
    loading,
    setLoading,
    hostname: {{{hostname}}},
    themeConfig: {{{themeConfig}}},
    _2_level_nav_available: {{{_2_level_nav_available}}},
    getDemoById,
  };

  return (
    <SiteContext.Provider value={context}>
      {outlet}
    </SiteContext.Provider>
  );
}