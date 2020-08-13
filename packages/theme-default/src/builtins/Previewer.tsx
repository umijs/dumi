/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState, useEffect, useContext } from 'react';
// @ts-ignore
import { history } from 'dumi';
import {
  context,
  useCodeSandbox,
  useRiddle,
  useCopy,
  useLocaleProps,
  Link,
  IPreviewerComponentProps,
} from 'dumi/theme';
import SourceCode from './SourceCode';
import './Previewer.less';

export interface IPreviewerProps extends IPreviewerComponentProps {
  /**
   * enable transform to change CSS containing block for demo
   */
  transform?: boolean;
  /**
   * modify background for demo area
   */
  background?: string;
  /**
   * collapse padding of demo area
   */
  compact?: string;
  /**
   * configurations for action button
   */
  hideActions?: ('CSB' | 'EXTERNAL' | 'RIDDLE')[];
  /**
   * show source code by default
   */
  defaultShowCode?: boolean;
}

const Previewer: React.FC<IPreviewerProps> = oProps => {
  const { locale } = useContext(context);
  const props = useLocaleProps<IPreviewerProps>(locale, oProps);
  const isActive = history.location.hash === `#${props.identifier}`;
  const isSingleFile = Object.keys(props.sources).length === 1;
  const openCSB = useCodeSandbox(props.hideActions?.includes('CSB') ? null : props);
  const openRiddle = useRiddle(props.hideActions?.includes('RIDDLE') ? null : props);
  const [copyCode, copyStatus] = useCopy();
  const [currentFile, setCurrentFile] = useState('_');
  const [sourceType, setSourceType] = useState<'jsx' | 'tsx'>();
  const [showSource, setShowSource] = useState(Boolean(props.defaultShowCode));
  const currentFileCode = props.sources[currentFile][sourceType] || props.sources[currentFile].jsx;

  useEffect(() => {
    setSourceType(props.sources._.tsx ? 'tsx' : 'jsx');
  }, []);

  return (
    <div
      {...props}
      className={[
        props.className,
        '__dumi-default-previewer',
        isActive ? '__dumi-default-previewer-target' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      id={props.identifier}
    >
      <div
        className="__dumi-default-previewer-demo"
        style={{
          transform: props.transform ? 'translate(0, 0)' : undefined,
          padding: props.compact ? '0' : undefined,
          background: props.background,
        }}
      >
        {props.children}
      </div>
      <div
        className="__dumi-default-previewer-desc"
        onClick={() => {
          history.push(`#${props.identifier}`);
        }}
        title={props.title}
        // eslint-disable-next-line
        dangerouslySetInnerHTML={{ __html: props.description }}
      />
      <div className="__dumi-default-previewer-actions">
        {openCSB && (
          <button
            title="Open demo on CodeSandbox.io"
            className="__dumi-default-icon"
            role="codesandbox"
            onClick={openCSB}
          />
        )}
        {openRiddle && (
          <button
            title="Open demo on Riddle"
            className="__dumi-default-icon"
            role="riddle"
            onClick={openRiddle}
          />
        )}
        {!props.hideActions?.includes('EXTERNAL') && (
          <Link to={`~demos/${props.identifier}`}>
            <button
              title="Open demo in new tab"
              className="__dumi-default-icon"
              role="open-demo"
              type="button"
            />
          </Link>
        )}
        <span />
        <button
          title="Copy source code"
          className="__dumi-default-icon"
          role="copy"
          data-status={copyStatus}
          onClick={() => copyCode(currentFileCode)}
        />
        {isSingleFile && showSource && (
          <button
            title="Toggle type for source code"
            className="__dumi-default-icon"
            role={`change-${sourceType}`}
            type="button"
            onClick={() => setSourceType(sourceType === 'tsx' ? 'jsx' : 'tsx')}
          />
        )}
        <button
          title="Toggle source code panel"
          className={`__dumi-default-icon${showSource ? ' __dumi-default-btn-expand' : ''}`}
          role="source"
          type="button"
          onClick={() => setShowSource(!showSource)}
        />
      </div>
      {showSource && (
        <div className="__dumi-default-previewer-source-wrapper">
          {!isSingleFile && (
            <ul className="__dumi-default-previewer-source-tab">
              {Object.keys(props.sources).map(filename => (
                <li className={currentFile === filename ? 'active' : ''} key={filename}>
                  <button type="button" onClick={() => setCurrentFile(filename)}>
                    {filename === '_' ? `index.${sourceType}` : filename}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="__dumi-default-previewer-source">
            <SourceCode code={currentFileCode} lang={sourceType} showCopy={false} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Previewer;
