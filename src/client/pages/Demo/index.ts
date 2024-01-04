import { useParams, useSiteData } from 'dumi';
import { createElement, type FC } from 'react';
import { useRenderer } from '../../theme-api/useRenderer';
import './index.less';

const DemoRenderPage: FC = () => {
  const { id } = useParams();
  const { demos } = useSiteData();
  const demo = demos[id!] || {};
  const { component, render } = demo;

  const ref = useRenderer(demo);

  const cancelable = render?.type === 'CANCELABLE';

  return cancelable
    ? createElement('div', {}, createElement('div', { ref }))
    : component && createElement(component);
};

export default DemoRenderPage;
