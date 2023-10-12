import { LiveContext } from 'dumi';
import React, { FC, useContext } from 'react';

const LiveDemo: FC = () => {
  const { demo } = useContext(LiveContext);

  return <>{demo}</>;
};

export default LiveDemo;
