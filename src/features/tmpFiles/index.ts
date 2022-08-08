import type { IApi } from '@/types';

export default (api: IApi) => {
  api.describe({ key: 'dumi:tmpFiles' });

  api.onGenerateFiles(() => {
    // generate context layout
    api.writeTmpFile({
      noPluginDir: true,
      path: 'dumi/Layout.tsx',
      content: `import { Context } from 'dumi/theme';
import { useOutlet } from 'umi';

export default function DumiContextLayout() {
  const outlet = useOutlet();

  return (
    <Context.Provider value={{}}>{outlet}</Context.Provider>
  );
}`,
    });
  });
};
