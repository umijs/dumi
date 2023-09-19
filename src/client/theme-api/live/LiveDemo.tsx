import React, { FC, useContext } from 'react';
import { LiveContext } from './LiveProvider';

const LiveDemo: FC = () => {
  const { demo } = useContext(LiveContext);

  return <>{demo}</>;
};

export default LiveDemo;
