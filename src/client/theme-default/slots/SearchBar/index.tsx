import { ReactComponent as IconSearch } from '@ant-design/icons-svg/inline-svg/outlined/search.svg';
import { useIntl, useSiteSearch } from 'dumi';
import React, { useEffect, useRef, useState, type FC } from 'react';
import SearchResult from '../SearchResult';
import './index.less';

const isAppleDevice = /(mac|iphone|ipod|ipad)/i.test(
  typeof navigator !== 'undefined' ? navigator?.platform : '',
);

const SearchBar: FC = () => {
  const intl = useIntl();
  const imeWaiting = useRef(false);
  const [focusing, setFocusing] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const [symbol, setSymbol] = useState('⌘');
  const { keywords, setKeywords, result, loading } = useSiteSearch();

  useEffect(() => {
    // why put useEffect?
    // to avoid Text content mismatch between server & client in ssr
    if (!isAppleDevice) {
      setSymbol('Ctrl');
    }

    const handler = (ev: KeyboardEvent) => {
      if ((isAppleDevice ? ev.metaKey : ev.ctrlKey) && ev.key === 'k') {
        input.current?.focus();
        ev.preventDefault();
      }
    };

    document.addEventListener('keydown', handler);

    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="dumi-default-search-bar">
      <IconSearch />
      <input
        onCompositionStart={() => (imeWaiting.current = true)}
        onCompositionEnd={(ev) => {
          imeWaiting.current = false;
          // special case: press Enter open IME panel will not trigger onChange
          setKeywords(ev.currentTarget.value);
        }}
        onFocus={() => setFocusing(true)}
        onBlur={() => {
          // wait for item click
          setTimeout(() => {
            setFocusing(false);
          }, 1);
        }}
        onKeyDown={(ev) => {
          if (['ArrowDown', 'ArrowUp'].includes(ev.key)) ev.preventDefault();
          // esc to blur input
          if (ev.key === 'Escape' && !imeWaiting.current)
            ev.currentTarget.blur();
        }}
        onChange={(ev) => {
          // wait for onCompositionEnd event be triggered
          setTimeout(() => {
            if (!imeWaiting.current) {
              setKeywords(ev.target.value);
            }
          }, 1);
        }}
        placeholder={intl.formatMessage({ id: 'header.search.placeholder' })}
        ref={input}
      />
      <span className="dumi-default-search-shortcut">{symbol} K</span>
      {keywords.trim() && focusing && (result.length || !loading) && (
        <div className="dumi-default-search-popover">
          <section>
            <SearchResult data={result} loading={loading} />
          </section>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
