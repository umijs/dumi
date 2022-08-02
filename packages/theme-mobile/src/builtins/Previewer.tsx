import React, { useRef, useEffect, useState, useContext, useCallback } from 'react';
import { context } from 'dumi/theme';
import type { IPreviewerProps } from 'dumi-theme-default/es/builtins/Previewer';
import Previewer from 'dumi-theme-default/es/builtins/Previewer';
import debounce from 'lodash.debounce';
import './Previewer.less';

export const ACTIVE_MSG_TYPE = 'dumi:scroll-into-demo';

export default (props: IPreviewerProps) => {
  const ref = useRef<HTMLDivElement>();
  const { meta } = useContext(context);
  const [previewerProps, setPreviewerProps] = useState<null | IPreviewerProps>(null);
  const [isActive, setIsActive] = useState(false);
  const isInactive = meta.mobile !== false && !isActive;
  const activeSelf = useCallback(() => {
    window.postMessage(
      {
        type: ACTIVE_MSG_TYPE,
        value: JSON.stringify({
          identifier: props.identifier,
          demoUrl: props.demoUrl,
          simulator: props.simulator,
        }),
      },
      '*',
    );
    setIsActive(true);
  }, [props]);

  useEffect(() => {
    // skip if page not loaded
    /* istanbul ignore next */
    if (!meta.title) return;

    const isFirstDemo = document.querySelector('.__dumi-default-mobile-previewer') === ref.current;
    const handler = debounce(() => {
      const navHeight = 64;
      // for active by previous title anchor
      const scrollTop = document.documentElement.scrollTop;
      const refElmTop = ref.current?.getBoundingClientRect().top + scrollTop;
      // do not offset front if the previous element is same the previewer
      const edgeOffset =
        ref.current?.previousElementSibling?.className === ref.current?.className
          ? navHeight
          : navHeight + 128;

      // post message if scroll into current demo
      if (
        // fallback to first demo
        (isFirstDemo && scrollTop < refElmTop) ||
        // detect scroll position
        (scrollTop + edgeOffset > refElmTop &&
          scrollTop + navHeight < refElmTop + ref?.current?.offsetHeight)
      ) {
        activeSelf();
      } else {
        setIsActive(false);
      }
    }, 50);

    if (
      // only render mobile phone when screen max than 960px
      window?.outerWidth > 960 &&
      // do not disable mobile simulator
      meta.mobile !== false
    ) {
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
  }, [props, meta]);

  useEffect(() => {
    const handler = ev => {
      if (
        ev.data.type === ACTIVE_MSG_TYPE &&
        isActive &&
        JSON.parse(ev.data.value).identifier !== props.identifier
      ) {
        setIsActive(false);
      }
    };

    window.addEventListener('message', handler);

    return () => window.removeEventListener('message', handler);
  });

  return (
    <div
      className={meta.mobile !== false ? '__dumi-default-mobile-previewer' : null}
      onClick={() => {
        if (isInactive) {
          activeSelf();
        }
      }}
      data-inactive={isInactive || undefined}
      ref={ref}
    >
      {previewerProps && (
        <Previewer
          className={isActive ? '__dumi-default-previewer-target' : null}
          {...previewerProps}
        />
      )}
    </div>
  );
};
