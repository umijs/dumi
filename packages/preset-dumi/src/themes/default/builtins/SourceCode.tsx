import React from 'react';
import Highlight, { defaultProps, Language } from 'prism-react-renderer';
import CopyButton from '../CopyButton';
import './SourceCode.less';

export interface ICodeBlockProps {
  code: string;
  lang: Language;
  showCopy?: boolean;
}

export default ({ code, lang, showCopy = true }: ICodeBlockProps) => (
  <div className="__dumi-default-code-block">
    <Highlight {...defaultProps} code={code} language={lang} theme={undefined}>
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre className={className} style={style}>
          {showCopy && <CopyButton className="__dumi-default-code-block-copy-btn" text={code} />}
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  </div>
);
