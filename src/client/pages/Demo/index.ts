import { useDemoData, useParams } from 'dumi';
import { createElement, type FC } from 'react';
import './index.less';

const DemoRenderPage: FC = () => {
  const { id } = useParams();

  const demoInfo = useDemoData(id!);

  const { component } = demoInfo!;

  return component && createElement(component);
};

export default DemoRenderPage;
