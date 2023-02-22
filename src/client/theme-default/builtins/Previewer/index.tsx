import classnames from 'classnames';
import { IPreviewerProps, useLocation } from 'dumi';
import PreviewerActions from 'dumi/theme/slots/PreviewerActions';
import React, { type FC } from 'react';
import './index.less';

function getIframeStyle(props: IPreviewerProps) {
  const style: React.CSSProperties = {};

  if (['string', 'number'].includes(typeof props.iframe)) {
    style.height = Number(props.iframe) || props.iframe;
  } else if (props.iframe?.height) {
    style.height = props.iframe.height;
  }

  return style;
}

const Previewer: FC<IPreviewerProps> = (props) => {
  const { hash } = useLocation();
  const link = `#${props.asset.id}`;
  const iframeProps = typeof props.iframe === 'object' ? props.iframe : {};

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
        data-iframe={Boolean(props.iframe) || undefined}
      >
        {props.iframe ? (
          <iframe
            {...iframeProps}
            style={getIframeStyle(props)}
            src={props.demoUrl}
          ></iframe>
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
        <PreviewerActions {...props} />
      </div>
    </div>
  );
};

export default Previewer;
