import { useParams, useSiteData, useTechStackRuntimeApi } from 'dumi';
import { createElement, type FC } from 'react';
import { useRenderer } from '../../theme-api/useRenderer';
import './index.less';

const DemoRenderPage: FC = () => {
  const { id } = useParams();
  const { demos } = useSiteData();
  const demo = demos[id!] || {};
  const { component } = demo;
  const { renderToCanvas } = useTechStackRuntimeApi();
  const ref = useRenderer(demo);
  return renderToCanvas
    ? createElement('div', {}, createElement('div', { ref }))
    : component && createElement(component);
};

export default DemoRenderPage;
