import SourceCode from 'dumi/theme/builtins/SourceCode';
import Tabs, { TabsProps } from 'rc-tabs';
import toArray from 'rc-util/lib/Children/toArray';
import React from 'react';
import './index.less';

type Unpacked<T> = T extends (infer U)[] ? U : T;
type Item = Unpacked<Required<TabsProps>['items']>;
type SourceCodeProps = Parameters<typeof SourceCode>[0];

function CodeGroup(props: React.PropsWithChildren) {
  const { children } = props;

  const usefulChildren = toArray(children).filter(
    (child) =>
      typeof child === 'object' &&
      typeof child.type === 'function' &&
      child.type?.name === SourceCode.name,
  ) as React.ReactElement<SourceCodeProps>[];

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
