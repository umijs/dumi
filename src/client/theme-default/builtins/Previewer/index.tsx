import classnames from 'classnames';
import { IPreviewerProps, evalCode, useDemoScopes, useLocation } from 'dumi';
import PreviewerActions from 'dumi/theme/slots/PreviewerActions';
import { highlight, languages } from 'prismjs';
import React, { useRef, useState, type FC } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Editor from 'react-simple-code-editor';
import { transform } from 'sucrase';
import './index.less';

const LiveDemo: FC<{ code: string; scopes: any }> = ({ code, scopes }) => {
  const Comp = evalCode(
    transform(code, { transforms: ['typescript', 'jsx'] }).code,
    scopes,
  );

  return <Comp />;
};

const Previewer: FC<IPreviewerProps> = (props) => {
  const demoContainer = useRef<HTMLDivElement>(null);
  const { hash } = useLocation();
  const link = `#${props.asset.id}`;

  const scopes = useDemoScopes(props.asset.id);

  const [code, setCode] = useState<string>(
    Object.entries(props.asset.dependencies).filter(
      ([, { type }]) => type === 'FILE',
    )[0][1].value,
  );

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
          // props.children
          <ErrorBoundary fallback={<div>Compiling...</div>} resetKeys={[code]}>
            <LiveDemo code={code} scopes={scopes} />
          </ErrorBoundary>
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
            <Editor
              value={code}
              onValueChange={(code) => setCode(code)}
              highlight={(code) => highlight(code, languages.js)}
              padding={10}
            />
          }
        />
      </div>
    </div>
  );
};

export default Previewer;
