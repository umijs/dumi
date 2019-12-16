export const parseImport = (file: string) => {
  const deps: { [key: string]: string } = {};
  const importRegex = /import.*['|"]/gm;
  (file || '').replace(importRegex, matchedImport => {
    const pkgNameRegex = /['|"](.*)['|"]/;
    const pkgName = matchedImport.match(pkgNameRegex) || [];
    if (pkgName) {
      const name = (pkgName[1] || '').trim();
      const version = (name.startsWith('@') ? name.split('@')[2] : name.split('@')[1]) || 'latest';
      if (name.includes('/')) {
        const nameList = name.split('/');
        if (name.startsWith('@')) {
          deps[`${nameList[0]}/${nameList[1]}`] = version;
        } else {
          deps[nameList[0]] = version;
        }
      } else {
        deps[name] = version;
      }
    }
    return matchedImport;
  });
  return deps;
};