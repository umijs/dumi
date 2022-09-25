import React, { type FC } from 'react';

const Sidebar: FC = () => {
  return (
    <div
      style={{
        borderRight: '1px solid #eee',
        width: 240,
        minHeight: '100vh',
        paddingTop: 16,
      }}
    >
      Sidebar Area
    </div>
  );
};

export default Sidebar;
