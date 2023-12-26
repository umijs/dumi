import type { ComponentType } from 'react';

export const evalCode = (code: string, scope: any): ComponentType => {
  const scopeKeys = Object.keys(scope);
  const scopeValues = scopeKeys.map((key) => scope[key]);
  const importReg = /import[\S\s]*?from.*;/g;

  return new Function(
    ...scopeKeys,
    code.replace(importReg, '').replace('export default', 'return').trim(),
  )(...scopeValues);
};
