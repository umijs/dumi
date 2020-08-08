import React, { useContext } from 'react';
import { context } from 'dumi/theme';

export default ({ children }) => {
  const ctx = useContext(context);

  console.log(ctx);

  return <>{children}</>;
};
