import classnames from 'classnames';
import {
  IPreviewerProps,
  LiveContext,
  LiveProvider,
  isLiveEnabled,
  useLocation,
} from 'dumi';
import LiveDemo from 'dumi/theme/slots/LiveDemo';
import LiveEditor from 'dumi/theme/slots/LiveEditor';
import LiveError from 'dumi/theme/slots/LiveError';
import PreviewerActions from 'dumi/theme/slots/PreviewerActions';
import React, { useContext, useRef, type FC } from 'react';
import './index.less';

const InternalPreviewer: FC<IPreviewerProps> = (props) => {
  const demoContainer = useRef<HTMLDivElement>(null);
  const { hash } = useLocation();
  const link = `#${props.asset.id}`;

  const { enabled } = useContext(LiveContext);

  return (
    <div
      id={props.asset.id}
      className={classnames('dumi-default-previewer', props.className)}
      style={props.style}
      data-debug={props.debug}
      data-active={hash === link || undefined}
    >
      <div
        className="dumi-default-previewer-demo"
        style={{ background: props.background }}
        data-compact={props.compact || undefined}
        data-transform={props.transform || undefined}
        data-iframe={props.iframe || undefined}
        ref={demoContainer}
      >
        {props.iframe ? (
          <iframe
            style={
              ['string', 'number'].includes(typeof props.iframe)
                ? { height: Number(props.iframe) }
                : {}
            }
            src={props.demoUrl}
          ></iframe>
        ) : enabled ? (
          <LiveDemo />
        ) : (
          props.children
        )}
      </div>
      <div className="dumi-default-previewer-meta">
        {(props.title || props.debug) && (
          <div className="dumi-default-previewer-desc">
            <h5>
              <a href={link}>
                {props.debug && <strong>DEV ONLY</strong>}
                {props.title}
              </a>
            </h5>
            {props.description && (
              <div
                className="markdown"
                dangerouslySetInnerHTML={{ __html: props.description }}
              />
            )}
          </div>
        )}
        <PreviewerActions
          {...props}
          demoContainer={
            props.iframe
              ? (demoContainer.current?.firstElementChild as HTMLIFrameElement)
              : demoContainer.current!
          }
          sourceCode={
            enabled ? (
              <div>
                <LiveEditor />
                <LiveError />
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
};

const Previewer: FC<IPreviewerProps> = (props) => {
  const children = <InternalPreviewer {...props} />;

  // Only Single File
  if (
    isLiveEnabled() ||
    props.live === false ||
    Object.entries(props.asset.dependencies).filter(
      ([, { type }]) => type === 'FILE',
    ).length > 1
  ) {
    return children;
  }

  return (
    <LiveProvider
      initialCode={
        Object.entries(props.asset.dependencies).filter(
          ([, { type }]) => type === 'FILE',
        )[0][1].value
      }
      demoId={props.asset.id}
    >
      {children}
    </LiveProvider>
  );
};

export default Previewer;
