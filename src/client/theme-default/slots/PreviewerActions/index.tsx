import { ReactComponent as IconCheck } from '@ant-design/icons-svg/inline-svg/outlined/check.svg';
import { ReactComponent as IconCodeSandbox } from '@ant-design/icons-svg/inline-svg/outlined/code-sandbox.svg';
import { ReactComponent as IconSketch } from '@ant-design/icons-svg/inline-svg/outlined/sketch.svg';
import { ReactComponent as IconStackBlitz } from '@ant-design/icons-svg/inline-svg/outlined/thunderbolt.svg';
import copy from 'copy-to-clipboard';
import {
  getSketchJSON,
  openCodeSandbox,
  openStackBlitz,
  useIntl,
  type IPreviewerProps,
} from 'dumi';
import SourceCode from 'dumi/theme/builtins/SourceCode';
import PreviewerActionsExtra from 'dumi/theme/slots/PreviewerActionsExtra';
import Tabs from 'rc-tabs';
import React, { useRef, useState, type FC, type ReactNode } from 'react';
import './index.less';
export interface IPreviewerActionsProps extends IPreviewerProps {
  /**
   * disabled actions
   */
  disabledActions?: ('CSB' | 'STACKBLITZ' | 'EXTERNAL' | 'HTML2SKETCH')[];
  extra?: ReactNode;
  forceShowCode?: boolean;
  demoContainer: HTMLDivElement | HTMLIFrameElement;
}

const IconCode: FC = () => (
  <svg viewBox="0 0 200 117">
    <path d="M59.688 2.578c-3.438-3.437-8.438-3.437-11.563 0L3.75 48.516c-5 5.937-5 14.062 0 19.062l44.063 45.938c1.562 1.562 4.062 2.5 5.937 2.5s4.063-.938 5.938-2.5c3.437-3.438 3.437-8.438 0-11.563l-42.5-43.437 42.5-44.063c3.437-3.437 3.437-8.437 0-11.875Zm135.937 45.938L151.25 2.578c-3.438-3.437-8.438-3.437-11.563 0-3.125 3.438-3.437 8.438 0 11.563l42.5 44.375-42.5 44.062c-3.437 3.438-3.437 8.438 0 11.563 1.563 1.562 3.438 2.5 5.938 2.5 2.5 0 4.063-.938 5.938-2.5l44.062-45.938c5.625-5.625 5.625-13.75 0-19.687Zm-75.938-45c-4.062-1.563-9.062.937-10.937 5l-34.063 95c-1.562 4.062.938 9.062 5 10.937.938 0 1.563.938 2.5.938 3.438 0 6.563-2.5 7.5-5.938l35-95.937c1.563-4.063-.937-9.063-5-10Z" />
  </svg>
);

const IconCodeExpand: FC = () => (
  <svg viewBox="0 0 200 117">
    <path d="M59.688 2.578c-3.438-3.437-8.438-3.437-11.563 0L3.75 48.516c-5 5.937-5 14.062 0 19.062l44.063 45.938c1.562 1.562 4.062 2.5 5.937 2.5s4.063-.938 5.938-2.5c3.437-3.438 3.437-8.438 0-11.563l-42.5-43.437 42.5-44.063c3.437-3.437 3.437-8.437 0-11.875Zm135.937 45.938L151.25 2.578c-3.438-3.437-8.438-3.437-11.563 0-3.125 3.438-3.437 8.438 0 11.563l42.5 44.375-42.5 44.062c-3.437 3.438-3.437 8.438 0 11.563 1.563 1.562 3.438 2.5 5.938 2.5 2.5 0 4.063-.938 5.938-2.5l44.062-45.938c5.625-5.625 5.625-13.75 0-19.687Z" />
  </svg>
);

const IconExternalLink: FC = () => (
  <svg viewBox="0 0 1024 1024">
    <path d="M853.333 469.333A42.667 42.667 0 0 0 810.667 512v256A42.667 42.667 0 0 1 768 810.667H256A42.667 42.667 0 0 1 213.333 768V256A42.667 42.667 0 0 1 256 213.333h256A42.667 42.667 0 0 0 512 128H256a128 128 0 0 0-128 128v512a128 128 0 0 0 128 128h512a128 128 0 0 0 128-128V512a42.667 42.667 0 0 0-42.667-42.667z" />
    <path d="M682.667 213.333h67.413L481.707 481.28a42.667 42.667 0 0 0 0 60.587 42.667 42.667 0 0 0 60.586 0L810.667 273.92v67.413A42.667 42.667 0 0 0 853.333 384 42.667 42.667 0 0 0 896 341.333V170.667A42.667 42.667 0 0 0 853.333 128H682.667a42.667 42.667 0 0 0 0 85.333z" />
  </svg>
);

const PreviewerActions: FC<IPreviewerActionsProps> = (props) => {
  const intl = useIntl();
  const files = Object.entries(props.asset.dependencies).filter(
    ([, { type }]) => type === 'FILE',
  );
  const [activeKey, setActiveKey] = useState(0);
  const [showCode, setShowCode] = useState(
    props.forceShowCode || props.defaultShowCode,
  );
  const copyTimer = useRef<number>();
  const [isCopied, setIsCopied] = useState(false);
  const isSingleFile = files.length === 1;
  const lang = (files[activeKey][0].match(/\.([^.]+)$/)?.[1] || 'text') as any;

  return (
    <>
      <div className="dumi-default-previewer-actions">
        {!props.disabledActions?.includes('CSB') && (
          <button
            className="dumi-default-previewer-action-btn"
            type="button"
            data-dumi-tooltip={intl.formatMessage({
              id: 'previewer.actions.codesandbox',
            })}
            onClick={() => openCodeSandbox(props)}
          >
            <IconCodeSandbox />
          </button>
        )}
        {!props.disabledActions?.includes('STACKBLITZ') && (
          <button
            className="dumi-default-previewer-action-btn"
            type="button"
            data-dumi-tooltip={intl.formatMessage({
              id: 'previewer.actions.stackblitz',
            })}
            onClick={() => openStackBlitz(props)}
          >
            <IconStackBlitz />
          </button>
        )}
        {!props.disabledActions?.includes('HTML2SKETCH') && getSketchJSON && (
          <span
            className="dumi-default-previewer-action-btn dumi-default-previewer-action-sketch"
            data-dumi-tooltip={intl.formatMessage({
              id: 'previewer.actions.sketch',
            })}
            data-copied={isCopied || undefined}
          >
            {isCopied ? <IconCheck /> : <IconSketch />}
            <select
              value=""
              onChange={(ev) => {
                const { value: type } = ev.target;

                switch (type) {
                  case 'group':
                  case 'symbol':
                    getSketchJSON(props.demoContainer, { type }).then(
                      (data) => {
                        copy(JSON.stringify(data));
                        setIsCopied(true);
                        clearTimeout(copyTimer.current);
                        copyTimer.current = window.setTimeout(
                          () => setIsCopied(false),
                          2000,
                        );
                      },
                    );
                    break;

                  case 'guide':
                    window.open('https://d.umijs.org/config#html2sketch');
                    break;

                  default:
                }
              }}
            >
              <option value="" hidden></option>
              <option value="group">
                {intl.formatMessage({ id: 'previewer.actions.sketch.group' })}
              </option>
              <option value="symbol">
                {intl.formatMessage({ id: 'previewer.actions.sketch.symbol' })}
              </option>
              <option value="-" disabled>
                {intl.formatMessage({ id: 'previewer.actions.sketch.divider' })}
              </option>
              <option value="guide">
                {intl.formatMessage({ id: 'previewer.actions.sketch.guide' })}
              </option>
            </select>
          </span>
        )}

        {!props.disabledActions?.includes('EXTERNAL') && (
          <a
            target="_blank"
            rel="noreferrer"
            href={props.demoUrl}
            className="dumi-default-previewer-action-btn"
            data-dumi-tooltip={intl.formatMessage({
              id: 'previewer.actions.separate',
            })}
          >
            <IconExternalLink />
          </a>
        )}
        {props.extra}
        <PreviewerActionsExtra {...props} />
        {!props.forceShowCode && (
          <button
            className="dumi-default-previewer-action-btn"
            type="button"
            onClick={() => setShowCode((prev) => !prev)}
            data-dumi-tooltip={intl.formatMessage({
              id: `previewer.actions.code.${showCode ? 'shrink' : 'expand'}`,
            })}
          >
            {showCode ? <IconCodeExpand /> : <IconCode />}
          </button>
        )}
      </div>
      {showCode && (
        <>
          <div className="dumi-default-previewer-sources">
            {!isSingleFile && (
              <Tabs
                className="dumi-default-previewer-tabs"
                prefixCls="dumi-default-tabs"
                moreIcon="···"
                defaultActiveKey={String(activeKey)}
                onChange={(key) => setActiveKey(Number(key))}
                items={files.map(([filename], i) => ({
                  key: String(i),
                  label: filename,
                }))}
              />
            )}
          </div>
          <SourceCode lang={lang}>{files[activeKey][1].value}</SourceCode>
        </>
      )}
    </>
  );
};

export default PreviewerActions;
