import React, { useState, useEffect, useRef, useContext } from 'react';
import { useSearch, AnchorLink, context } from 'dumi/theme';
import classnames from 'classnames';
import './SearchBar.less';

type StateChangeHandler<StateType> = (state: StateType) => any;
interface SearchBarProps {
  setIsSearch: StateChangeHandler<boolean>;
}
export default (props: SearchBarProps) => {
  const {
    config: {
      mode,
    },
    meta: contextMeta
  } = useContext(context);
  const [keywords, setKeywords] = useState<string>('');
  const [items, setItems] = useState([]);
  const input = useRef<HTMLInputElement>();
  const result = useSearch(keywords);
  const isDocAndPc = !contextMeta.mobile && mode === 'doc';

  useEffect(() => {
    if (Array.isArray(result)) {
      setItems(result);
    } else if (typeof result === 'function') {
      result(`.${input.current.className}`);
    }
  }, [result]);

  const renderLink = (meta) => {
    if (!isDocAndPc) {
      return <AnchorLink to={meta.path}>
        {meta.parent?.title
          && <span>{meta.parent.title}</span>}
        {meta.title}
      </AnchorLink>
    }
    return <AnchorLink to={meta.path}>
      {meta.title}
    </AnchorLink>
  }
  return (
    <div className={classnames("__dumi-default-search", {
      "__dumi-default-search-doc": isDocAndPc,
    })}>
      <input
        className={classnames("__dumi-default-search-input", {
          "__dumi-default-search-doc-input": isDocAndPc,
        })}
        type="search"
        ref={input}
        {...(Array.isArray(result)
          ? {
            value: keywords, onChange: ev => {
              setKeywords(ev.target.value);
              props.setIsSearch(!!ev.target.value);
            }
          }
          : {})}
      />
      <ul className={classnames({"__dumi-default-menu-list": isDocAndPc})}>
        {items.map(meta => (
          <li key={meta.path} onClick={() => {
            setKeywords('');
            props.setIsSearch(false);
          }}>
            {renderLink(meta)}
          </li>
        ))}
      </ul>
    </div>
  );
};
