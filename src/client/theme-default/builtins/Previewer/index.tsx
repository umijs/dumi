import { ReactComponent as IconError } from '@ant-design/icons-svg/inline-svg/filled/close-circle.svg';
import classnames from 'classnames';
import { useLiveDemo, useLocation, type IPreviewerProps } from 'dumi';
import PreviewerActions from 'dumi/theme/slots/PreviewerActions';
import React, { useRef, useState, type FC } from 'react';
import './index.less';

const Previewer: FC<IPreviewerProps> = (props) => {
  const demoContainer = useRef<HTMLDivElement>(null);
  const { hash } = useLocation();
  const link = `#${props.asset.id}`;
  const {
    node: liveDemoNode,
    error: liveDemoError,
    setSources: setLiveDemoSources,
  } = useLiveDemo(props.asset.id);
  const [editorError, setEditorError] = useState<Error | null>(null);
  const combineError = liveDemoError || editorError;

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
        ) : (
          liveDemoNode || props.children
        )}
      </div>
      {combineError && (
        <div className="dumi-default-previewer-demo-error">
          <IconError />
          {combineError.toString()}
        </div>
      )}
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
          onSourcesTranspile={({ err, sources }) => {
            if (err) {
              setEditorError(err);
            } else {
              setEditorError(null);
              setLiveDemoSources(sources);
            }
          }}
          demoContainer={
            props.iframe
              ? (demoContainer.current?.firstElementChild as HTMLIFrameElement)
              : demoContainer.current!
          }
        />
      </div>
    </div>
  );
};

export default Previewer;
