import classnames from 'classnames';
import { IPreviewerProps, useLocation } from 'dumi';
import PreviewerActions from 'dumi/theme/slots/PreviewerActions';
import React, { type FC } from 'react';
import './index.less';

const Previewer: FC<IPreviewerProps> = (props) => {
  const { hash } = useLocation();
  const link = `#${props.asset.id}`;

  return (
    <div
      id={props.asset.id}
      className={classnames({
        'dumi-default-previewer': true,
        [props?.className]: !!props?.className,
      })}
      data-debug={props.debug}
      data-active={hash === link || undefined}
    >
      <div
        className={classnames({
          'dumi-default-previewer-demo': true,
          [`${props?.className}-demo`]: !!props?.className,
        })}
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
      <div
        className={classnames({
          'dumi-default-previewer-meta': true,
          [`${props?.className}-meta`]: !!props?.className,
        })}
      >
        {(props.title || props.debug) && (
          <div
            className={classnames({
              'dumi-default-previewer-desc': true,
              [`${props?.className}-desc`]: !!props?.className,
            })}
          >
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
