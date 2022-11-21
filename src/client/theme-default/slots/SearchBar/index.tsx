import { ReactComponent as IconSearch } from '@ant-design/icons-svg/inline-svg/outlined/search.svg';
import { useSiteSearch } from 'dumi';
import React, { useEffect, useRef, useState, type FC } from 'react';
import SearchResult from '../SearchResult';
import './index.less';
import { Input, type InputRef } from './Input';
import { Mask } from './Mask';
export { Input as SearchInput, type InputRef as SearchInputRef } from './Input';
export { Mask as SearchMask } from './Mask';

const isAppleDevice = /(mac|iphone|ipod|ipad)/i.test(
  typeof navigator !== 'undefined' ? navigator?.platform : '',
);

const SearchBar: FC = () => {
  const [focusing, setFocusing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const modalInputRef = useRef<InputRef>(null);
  const [symbol, setSymbol] = useState('⌘');
  const { keywords, setKeywords, result, loading } = useSiteSearch();
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // why put useEffect?
    // to avoid Text content mismatch between server & client in ssr
    if (!isAppleDevice) {
      setSymbol('Ctrl');
    }

    const handler = (ev: KeyboardEvent) => {
      if (
        ((isAppleDevice ? ev.metaKey : ev.ctrlKey) && ev.key === 'k') ||
        ev.key === '/'
      ) {
        ev.preventDefault();

        if (inputRef.current) {
          const { top, bottom, left, right } =
            inputRef.current?.nativeElement!.getBoundingClientRect();
          const isInViewport =
            top >= 0 &&
            left >= 0 &&
            bottom <= window.innerHeight &&
            right <= window.innerWidth;

          if (isInViewport) {
            inputRef.current?.focus();
          } else {
            setKeywords('');
            setModalVisible(true);
            setTimeout(() => {
              modalInputRef.current?.focus();
            });
          }
        }
      }
    };

    document.addEventListener('keydown', handler);

    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="dumi-default-search-bar">
      <IconSearch className="dumi-default-search-bar-svg" />
      <Input
        onFocus={() => setFocusing(true)}
        onBlur={() => {
          // wait for item click
          setTimeout(() => {
            setFocusing(false);
          }, 1);
        }}
        onChange={(keywords) => setKeywords(keywords)}
        ref={inputRef}
      />
      <span className="dumi-default-search-shortcut">{symbol} K</span>
      {keywords.trim() &&
        focusing &&
        (result.length || !loading) &&
        !modalVisible && (
          <div className="dumi-default-search-popover">
            <section>
              <SearchResult data={result} loading={loading} />
            </section>
          </div>
        )}

      <Mask
        visible={modalVisible}
        onMaskClick={() => {
          setModalVisible(false);
          setKeywords('');
        }}
      >
        <div style={{ position: 'relative' }}>
          <IconSearch className="dumi-default-search-bar-svg" />
          <Input
            onFocus={() => setFocusing(true)}
            onBlur={() => {
              // wait for item click
              setTimeout(() => {
                setFocusing(false);
              }, 1);
            }}
            onChange={(keywords) => setKeywords(keywords)}
            ref={modalInputRef}
          />
        </div>

        <SearchResult
          data={result}
          loading={loading}
          onClick={() => {
            setModalVisible(false);
            setKeywords('');
          }}
        />
      </Mask>
    </div>
  );
};

export default SearchBar;
