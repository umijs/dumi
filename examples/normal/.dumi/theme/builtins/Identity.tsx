import * as React from 'react';

export interface IdentityProps {
  [key: string]: React.ReactNode;
}

function Identity(props: React.PropsWithChildren<IdentityProps>) {
  const { children, ...restProps } = props;
  return (
    <ul>
      {Object.entries(restProps).map(([key, value]) => (
        <li key={key}>{value}</li>
      ))}
      {children && <li>{children}</li>}
    </ul>
  );
}

export default Identity;
