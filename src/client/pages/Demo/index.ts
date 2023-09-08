import { useDemoData, useParams } from 'dumi';
import { createElement, type FC } from 'react';
import './index.less';

const DemoRenderPage: FC = () => {
  const { id } = useParams();

  const demoData = useDemoData(id!);

  if (!demoData) {
    return `Demo '${id}' not found!`;
  }

  const { component } = demoData;

  return component && createElement(component);
};

export default DemoRenderPage;
