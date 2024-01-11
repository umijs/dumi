import { ReactComponent as IconError } from '@ant-design/icons-svg/inline-svg/filled/close-circle.svg';
import classnames from 'classnames';
import { DumiDemoContext, useLocation, type IPreviewerProps } from 'dumi';
import PreviewerActions from 'dumi/theme/slots/PreviewerActions';
import React, { useCallback, useContext, useState, type FC } from 'react';
import './index.less';

const Previewer: FC<IPreviewerProps> = (props) => {
  const [demoContainer, setDemoContainer] = useState<
    HTMLDivElement | HTMLIFrameElement | null
  >(null);

  const handleContainerRef = useCallback((node: HTMLDivElement) => {
    if (!node) return;
    if (props.iframe) {
      setDemoContainer(node.firstElementChild as HTMLIFrameElement);
    } else {
      setDemoContainer(node);
    }
  }, []);

  const { demoError, setEditorError, setLiveDemoSource } =
    useContext(DumiDemoContext);

  const { hash } = useLocation();
  const link = `#${props.asset.id}`;

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
        ref={handleContainerRef}
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
      {demoError && (
        <div className="dumi-default-previewer-demo-error">
          <IconError />
          {demoError.toString()}
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
        {demoContainer && (
          <PreviewerActions
            {...props}
            onSourceTranspile={({ err, source }) => {
              if (err) {
                setEditorError!(err);
              } else {
                setEditorError!(null);
                setLiveDemoSource!(source);

                if (props.iframe) {
                  demoContainer
                    .querySelector('iframe')!
                    .contentWindow!.postMessage({
                      type: 'dumi.liveDemo.setSources',
                      value: source,
                    });
                }
              }
            }}
            demoContainer={demoContainer}
          />
        )}
      </div>
    </div>
  );
};

export default Previewer;
