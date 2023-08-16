import { ReactComponent as IconCheck } from '@ant-design/icons-svg/inline-svg/outlined/check.svg';
import { ReactComponent as IconCopy } from '@ant-design/icons-svg/inline-svg/outlined/copy.svg';
import classNames from 'classnames';
import { useSiteData } from 'dumi';
import Highlight, { defaultProps, type Language } from 'prism-react-renderer';
import 'prism-themes/themes/prism-one-light.css';
import React, { useRef, useState, useEffect, type FC } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import './index.less';

/**
 * define DSL which can be highlighted as similar language
 */
const SIMILAR_DSL: Record<string, Language> = {
  acss: 'css',
  axml: 'markup',
};

interface SourceCodeProps {
  children: string;
  lang: Language;
  highlightLines?: number[];
}

const SourceCode: FC<SourceCodeProps> = (props) => {
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
      <Highlight
        {...defaultProps}
        code={children.trim()}
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
    </div>
  );
};

export default SourceCode;
