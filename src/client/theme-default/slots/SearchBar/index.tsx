import { ReactComponent as IconSearch } from '@ant-design/icons-svg/inline-svg/outlined/search.svg';
import { useIntl } from 'dumi';
import React, { useEffect, useRef, type FC } from 'react';
import './index.less';

const isAppleDevice = /(mac|iphone|ipod|ipad)/i.test(navigator.platform);

const SearchBar: FC = () => {
  const intl = useIntl();
  const input = useRef<HTMLInputElement>(null);
  const symbol = isAppleDevice ? '⌘' : 'Ctrl';

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      if (
        (isAppleDevice ? ev.metaKey : ev.ctrlKey) &&
        (ev.keyCode === 75 || ev.code === 'KeyK')
      ) {
        input.current?.focus();
      }
    };

    document.addEventListener('keydown', handler);

    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div
      className="dumi-default-search-bar"
      data-dumi-tooltip="暂不可用"
      data-dumi-tooltip-bottom
    >
      <IconSearch />
      <input
        placeholder={intl.formatMessage({ id: 'header.search.placeholder' })}
        ref={input}
        disabled
      />
      <span className="dumi-default-search-shortcut">{symbol} K</span>
    </div>
  );
};

export default SearchBar;
