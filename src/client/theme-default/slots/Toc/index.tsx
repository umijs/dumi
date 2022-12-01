import { Scrollspy as ScrollSpy } from '@makotot/ghostui/src/Scrollspy';
import { Link, useLocation, useRouteMeta, useSiteData } from 'dumi';
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
  const { loading } = useSiteData();
  const prevIndexRef = useRef(0);
  const [sectionRefs, setSectionRefs] = useState<RefObject<HTMLElement>[]>([]);
  // only render h2 ~ h4
  const toc = meta.toc.filter(({ depth }) => depth > 1 && depth < 4);

  useEffect(() => {
    // wait for page component ready (DOM ready)
    if (!loading) {
      // find all valid headings as ref elements
      const refs = toc.map(({ id }) => ({
        current: document.getElementById(id),
      }));

      setSectionRefs(refs as any);
    }
  }, [pathname, search, loading]);

  return sectionRefs.length ? (
    <ScrollSpy sectionRefs={sectionRefs}>
      {({ currentElementIndexInViewport }) => {
        // for keep prev item active when no item in viewport
        if (currentElementIndexInViewport > -1)
          prevIndexRef.current = currentElementIndexInViewport;

        return (
          <ul className="dumi-default-toc">
            {toc
              .filter(({ depth }) => depth > 1 && depth < 4)
              .map((item, i) => {
                const link = `#${encodeURIComponent(item.id)}`;
                const activeIndex =
                  currentElementIndexInViewport > -1
                    ? currentElementIndexInViewport
                    : prevIndexRef.current;

                return (
                  <li key={item.id} data-depth={item.depth}>
                    <Link
                      to={link}
                      title={item.title}
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
