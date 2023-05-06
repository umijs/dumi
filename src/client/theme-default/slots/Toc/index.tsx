import { Scrollspy as ScrollSpy } from '@makotot/ghostui/src/Scrollspy';
import { Link, useLocation, useRouteMeta, useSiteData, useTabMeta } from 'dumi';
import React, {
  useEffect,
  useRef,
  useState,
  type FC,
  type RefObject,
} from 'react';
import './index.less';

const Toc: FC = () => {
  const { pathname, search } = useLocation();
  const meta = useRouteMeta();
  const tabMeta = useTabMeta();
  const { loading } = useSiteData();
  const prevIndexRef = useRef(0);
  const [sectionRefs, setSectionRefs] = useState<RefObject<HTMLElement>[]>([]);

  const memoToc = React.useMemo(() => {
    let toc = meta.toc;
    if (tabMeta) {
      toc = tabMeta.toc;
    }
    // only render h2 ~ h4
    return toc.filter(({ depth }) => depth > 1 && depth < 4);
  }, [meta, tabMeta]);

  useEffect(() => {
    // wait for page component ready (DOM ready)
    if (!loading) {
      // find all valid headings as ref elements
      const refs = memoToc.map(({ id }) => ({
        current: document.getElementById(id),
      }));

      setSectionRefs(refs as any);
    }
  }, [pathname, search, loading]);

  const getElmScrollPosition = (elm: HTMLElement): number => {
    return (
      elm.offsetTop + (elm.offsetParent ? getElmScrollPosition(elm.offsetParent as HTMLElement) : 0)
    );
  }

  const scrollTo = (anchor: string) => {
    // wait for dom update
    window.requestAnimationFrame(() => {
      const elm = document.getElementById(decodeURIComponent(anchor));
  
      if (elm) {
        // compatible in Edge
        window.scrollTo(0, getElmScrollPosition(elm) - 100);
      }
    });
  };

  return sectionRefs.length ? (
    <ScrollSpy sectionRefs={sectionRefs}>
      {({ currentElementIndexInViewport }) => {
        // for keep prev item active when no item in viewport
        if (currentElementIndexInViewport > -1)
          prevIndexRef.current = currentElementIndexInViewport;

        return (
          <ul className="dumi-default-toc">
            {memoToc
              .filter(({ depth }) => depth > 1 && depth < 4)
              .map((item, i) => {
                const link = `${search}#${encodeURIComponent(item.id)}`;
                const activeIndex =
                  currentElementIndexInViewport > -1
                    ? currentElementIndexInViewport
                    : prevIndexRef.current;

                return (
                  <li key={item.id} data-depth={item.depth}>
                    <Link
                      to={link}
                      title={item.title}
                      onClick={()=>scrollTo(encodeURIComponent(item.id))}
                      {...(activeIndex === i ? { className: 'active' } : {})}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
          </ul>
        );
      }}
    </ScrollSpy>
  ) : null;
};

export default Toc;
