import React, { useRef, useEffect, useState } from 'react';
import Previewer, { IPreviewerProps } from 'dumi-theme-default/src/builtins/Previewer';
import debounce from 'lodash.debounce';
import './Previewer.less';

export const ACTIVE_MSG_TYPE = 'dumi:scroll-into-demo';

export default (props: IPreviewerProps) => {
  const ref = useRef<HTMLDivElement>();
  const [previewerProps, setPreviewerProps] = useState<null | IPreviewerProps>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const isFirstDemo = document.querySelector('.__dumi-default-mobile-previewer') === ref.current;
    const handler = debounce(() => {
      const scrollTop = document.documentElement.scrollTop + 128;

      // post message if scroll into current demo
      if (
        // fallback to first demo
        (isFirstDemo && scrollTop < ref?.current?.offsetTop) ||
        // detect scroll position
        (scrollTop > ref?.current?.offsetTop &&
          scrollTop < ref?.current?.offsetTop + ref?.current?.offsetHeight)
      ) {
        window.postMessage({ type: ACTIVE_MSG_TYPE, value: props.identifier }, '*');
        setIsActive(true);
      } else {
        setIsActive(false);
      }
    }, 50);

    // only render mobile phone when screen max than 960px
    if (window?.outerWidth > 960) {
      // active source code wrapper if scroll into demo
      handler();
      window.addEventListener('scroll', handler);

      // rewrite props for device mode
      setPreviewerProps(
        Object.assign({}, props, {
          // omit iframe
          iframe: null,
          // omit children
          children: null,
          // show source code
          defaultShowCode: true,
          // hide external action
          hideActions: ['EXTERNAL' as IPreviewerProps['hideActions'][0]].concat(props.hideActions),
        }),
      );
    } else {
      // use standard mode if screen min than 960px
      setPreviewerProps(props);
    }

    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="__dumi-default-mobile-previewer" ref={ref}>
      {previewerProps && (
        <Previewer
          className={isActive ? '__dumi-default-previewer-target' : null}
          {...previewerProps}
        />
      )}
    </div>
  );
};
