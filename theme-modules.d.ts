declare module 'dumi/theme/slots/*' {
  import type { ComponentType } from 'react';

  const component: ComponentType<any>;
  export default component;
}

declare module 'dumi/theme/builtins/*' {
  import type { ComponentType } from 'react';

  const component: ComponentType<any>;
  export default component;
}

declare module 'dumi/theme/builtins/SourceCode' {
  import type { ComponentType, ReactNode } from 'react';

  export interface ISourceCodeProps {
    children?: string;
    lang?: string;
    textarea?: ReactNode;
    extra?: ReactNode;
    [key: string]: any;
  }

  const SourceCode: ComponentType<ISourceCodeProps>;
  export default SourceCode;
}

declare module 'dumi/theme/slots/ContentTabs' {
  import type { IRouteMeta } from 'dumi';
  import type { ComponentType } from 'react';

  type IContentTabs = IRouteMeta['tabs'];

  export interface IContentTabsProps {
    tabs: IContentTabs;
    tabKey: string | null;
    onChange: (tab?: NonNullable<IContentTabs>[0]) => void;
  }

  const ContentTabs: ComponentType<IContentTabsProps>;
  export default ContentTabs;
}

declare module 'dumi/theme/slots/SourceCodeEditor' {
  import type { ISourceCodeProps } from 'dumi/theme/builtins/SourceCode';
  import type { ComponentType, ReactNode } from 'react';

  export interface ISourceCodeEditorProps
    extends Omit<ISourceCodeProps, 'children'> {
    initialValue: string;
    onTranspile?: (
      args: { err: Error; code?: null } | { err?: null; code: string },
    ) => void;
    onChange?: (code: string) => void;
    extra?: ReactNode;
  }

  const SourceCodeEditor: ComponentType<ISourceCodeEditorProps>;
  export default SourceCodeEditor;
}
