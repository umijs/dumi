import React, { useState } from 'react';
import Clipboard from 'react-clipboard.js';
import './CopyButton.less';

export default ({
  text,
  className,
  style,
}: {
  text: string;
  style?: React.CSSProperties;
  className?: string;
}) => {
  const [copyTimer, setCopyTimer] = useState<NodeJS.Timeout>();

  return (
    <Clipboard
      button-className={`__dumi-default-icon __dumi-default-btn-copy ${className || ''}`}
      button-style={style}
      button-data-status={copyTimer ? 'copied' : 'copy'}
      data-clipboard-text={text}
      onSuccess={() => {
        setCopyTimer(timer => {
          clearTimeout(timer);

          return setTimeout(() => {
            setCopyTimer(null);
          }, 2000);
        });
      }}
    />
  );
};
