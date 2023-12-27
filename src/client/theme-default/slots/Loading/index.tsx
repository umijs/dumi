import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './index.less';

const Loading: React.FC = () => (
  <div className="dumi-default-loading-skeleton">
    <Skeleton className="first-line" count={1} />
    <Skeleton count={2} />
    <Skeleton count={1} width="75%" />
  </div>
);

export default Loading;
