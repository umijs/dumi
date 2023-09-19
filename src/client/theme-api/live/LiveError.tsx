import { ReactComponent as IconError } from '@ant-design/icons-svg/inline-svg/filled/close-circle.svg';
import React, { FC, useContext } from 'react';
import { LiveContext } from './LiveProvider';
import './index.less';

const LiveError: FC = () => {
  const { error } = useContext(LiveContext);

  if (!error) {
    return null;
  }

  return (
    <pre className={'dumi-default-live-error'}>
      <IconError />
      {error}
    </pre>
  );
};

export default LiveError;
