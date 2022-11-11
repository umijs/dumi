import throttle from 'lodash.throttle';
import React, {
  useEffect,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import './index.less';

const Table: FC<{ children: ReactNode }> = ({ children, ...props }) => {
  const container = useRef<HTMLDivElement>(null);
  const [leftFolded, setLeftFolded] = useState(false);
  const [rightFolded, setRightFolded] = useState(false);

  // watch content scroll to render folded shadow
  useEffect(() => {
    const elm = container.current;
    if (elm) {
      const handler = throttle(() => {
        setLeftFolded(elm.scrollLeft > 0);
        setRightFolded(elm.scrollLeft < elm.scrollWidth - elm.offsetWidth);
      }, 100);

      handler();
      elm.addEventListener('scroll', handler);
      window.addEventListener('resize', handler);

      return () => {
        elm.removeEventListener('scroll', handler);
        window.removeEventListener('resize', handler);
      };
    }
  }, []);

  return (
    <div className="dumi-default-table">
      <div
        className="dumi-default-table-content"
        ref={container}
        data-left-folded={leftFolded || undefined}
        data-right-folded={rightFolded || undefined}
      >
        <table {...props}>{children}</table>
      </div>
    </div>
  );
};

export default Table;
