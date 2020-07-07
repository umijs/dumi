import React from 'react';
import Context from './context';

/**
 * outer theme layout
 */
export default ({ children }) => {
  // TODO:
  //   1. 锚点跟随
  //   2. 元数据加工及传递给 Context
  return <Context.Provider value={{} as any}>{children}</Context.Provider>;
};
