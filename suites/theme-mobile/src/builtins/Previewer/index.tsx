import { IPreviewerProps, useLocation, useRouteMeta } from 'dumi';
import Device from 'dumi/theme/slots/Device';
import PreviewerActions from 'dumi/theme/slots/PreviewerActions';
import React, { type FC } from 'react';
import './index.less';

const Previewer: FC<IPreviewerProps> = (props) => {
  const { hash } = useLocation();
  const link = `#${props.asset.id}`;
  const {
    frontmatter: { mobile = true },
  } = useRouteMeta();

  return (
    <div
      id={props.asset.id}
      className="dumi-default-previewer"
      data-debug={props.debug}
      data-active={hash === link || undefined}
      data-h5={mobile}
    >
      {!mobile && (
        <div
          className="dumi-default-previewer-demo"
          style={{ background: props.background }}
          data-compact={props.compact || undefined}
          data-transform={props.transform || undefined}
          data-iframe={props.iframe || undefined}
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
          ) : (
            props.children
          )}
        </div>
      )}
      <div className="dumi-default-previewer-meta" data-h5={mobile}>
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

        {!mobile && <PreviewerActions {...props} />}
        {mobile && (
          <div className="dumi-default-previewer-flex">
            <div className="dumi-default-previewer-flex-actions">
              <PreviewerActions {...props} hasShowCodeButton={false} />
            </div>
            <Device url={props.demoUrl} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Previewer;
