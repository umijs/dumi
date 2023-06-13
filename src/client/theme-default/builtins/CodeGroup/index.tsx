import SourceCode from 'dumi/theme/builtins/SourceCode';
import { Language } from 'prism-react-renderer';
import Tabs from 'rc-tabs';
import React from 'React';

import './index.less';

interface CodeGroupItem {
  label: string;
  key: string;
  lang: Language;
  codeValue: string;
}

interface CodeGroupProps {
  items: CodeGroupItem[];
  defaultActiveKey?: string;
  prefixCls?: string;
  className?: string;
  moreIcon?: string;
  onChange?: (activeKey: string) => void;
}
const CodeGroup: React.FC<CodeGroupProps> = ({
  items,
  defaultActiveKey = '1',
  prefixCls = 'dumi-default-tabs',
  ...restProps
}) => {
  return (
    <Tabs
      defaultActiveKey={defaultActiveKey}
      prefixCls={prefixCls}
      items={items.map(({ label, key, lang, codeValue }) => ({
        label,
        key,
        children: <SourceCode lang={lang}>{codeValue}</SourceCode>,
      }))}
      {...restProps}
    />
  );
};

export default CodeGroup;
