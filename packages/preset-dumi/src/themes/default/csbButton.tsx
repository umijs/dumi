import React from 'react';

interface ButtonProps {
  type: 'tsx' | 'jsx';
  base64: string;
  children: React.ReactNode;
}

export default ({ type, base64, children }: ButtonProps) => (
  <form
    style={{ display: 'flex' }}
    method="POST"
    action={`https://codesandbox.io/api/v1/sandboxes/define?query=module=/demo.${type}`}
    target="_blank"
  >
    {children}
    <input type="hidden" value={base64} name="parameters" />
  </form>
);
