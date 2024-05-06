import Tabs, { ITabsProps } from '@/client/theme-default/slots/Tabs';
import { ISourceCodeProps } from 'dumi/theme/builtins/SourceCode';
import React, { Children } from 'react';

type Unpacked<T> = T extends (infer U)[] ? U : T;
type Item = Unpacked<Required<ITabsProps>['items']>;

const isSourceCodeElement = (
  child: React.ReactNode,
): child is React.ReactElement<ISourceCodeProps> =>
  typeof child === 'object' &&
  child !== null &&
  typeof (child as React.ReactElement).type === 'function';

function CodeGroup(props: React.PropsWithChildren) {
  const { children } = props;

  const usefulChildren = Children.toArray(children).filter(isSourceCodeElement);

  const items = usefulChildren.map<Item>((child, idx) => {
    const { lang, title } = child.props ?? {};

    return {
      key: String(child.key ?? idx),
      label: title || lang || 'txt', // fallback to txt if no lang and title
      children: child,
    };
  });

  return <Tabs className="dumi-default-code-group" items={items} />;
}

export default CodeGroup;
