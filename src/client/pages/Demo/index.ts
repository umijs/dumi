import { useDemo, useParams } from 'dumi';
import { createElement, type FC } from 'react';
import './index.less';

const DemoRenderPage: FC = () => {
  const { id } = useParams();
  const { component } = useDemo(id!) || {};

  return component && createElement(component);
};

export default DemoRenderPage;
