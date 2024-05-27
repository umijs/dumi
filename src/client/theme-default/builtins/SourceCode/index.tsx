import { ReactComponent as IconCheck } from '@ant-design/icons-svg/inline-svg/outlined/check.svg';
import { ReactComponent as IconCopy } from '@ant-design/icons-svg/inline-svg/outlined/copy.svg';
import classNames from 'classnames';
import { useSiteData } from 'dumi';
import Highlight, { defaultProps, type Language } from 'prism-react-renderer';
import 'prism-themes/themes/prism-one-light.css';
import React, {
  useEffect,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './index.less';

/**
 * define DSL which can be highlighted as similar language
 */
const SIMILAR_DSL: Record<string, Language> = {
  acss: 'css',
  axml: 'markup',
  vue: 'markup',
};

export interface ISourceCodeProps {
  children: string;
  lang: Language;
  highlightLines?: number[];
  extra?: ReactNode;
  textarea?: ReactNode;
  title?: string;
}

const SourceCode: FC<ISourceCodeProps> = (props) => {
  const { children = '', lang, highlightLines = [] } = props;
  const timer = useRef<number>();
  const [isCopied, setIsCopied] = useState(false);
  const [text, setText] = useState(children);
  const { themeConfig } = useSiteData();

  useEffect(() => {
    const isShell = /shellscript|shell|bash|sh|zsh/.test(lang);
    if (isShell) {
      const text = children.replace(/^(\$|>)\s/gm, '');
      setText(text);
    }
  }, [lang, children]);

  const code = (
    <Highlight
      {...defaultProps}
      code={props.textarea ? children : children.trim()}
      language={SIMILAR_DSL[lang] || lang}
      theme={undefined}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={style}>
          {tokens.map((line, i) => (
            <div
              key={String(i)}
              className={classNames({
                highlighted: highlightLines.includes(i + 1),
                wrap: themeConfig.showLineNum,
              })}
            >
              {themeConfig.showLineNum && (
                <span className="token-line-num">{i + 1}</span>
              )}
              <div
                {...getLineProps({
                  line,
                  key: i,
                })}
                className={classNames({
                  'line-cell': themeConfig.showLineNum,
                })}
              >
                {line.map((token, key) => (
                  // getTokenProps 返回值包含 key
                  // eslint-disable-next-line react/jsx-key
                  <span {...getTokenProps({ token, key })} />
                ))}
              </div>
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );

  return (
    <div className="dumi-default-source-code">
      <CopyToClipboard
        text={text}
        onCopy={() => {
          setIsCopied(true);
          clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setIsCopied(false), 2000);
        }}
      >
        <button
          type="button"
          className="dumi-default-source-code-copy"
          data-copied={isCopied || undefined}
        >
          {isCopied ? <IconCheck /> : <IconCopy />}
        </button>
      </CopyToClipboard>
      {props.textarea ? (
        <div className="dumi-default-source-code-scroll-container">
          <div className="dumi-default-source-code-scroll-content">
            {code}
            {props.textarea}
          </div>
        </div>
      ) : (
        code
      )}
      {props.extra}
    </div>
  );
};

export default SourceCode;
