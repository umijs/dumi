import * as React from 'react';

export interface Bug1836Props {
  slogan?: React.ReactNode;
  onChange?: React.ReactNode;
}

function Bug1836(props: React.PropsWithChildren<Bug1836Props>) {
  const { children } = props;
  return (
    <>
      <div className="my-slogan">
        <p>
          {props.slogan ?? '魔法师正在进行最后的仪式，为您带来一项惊艳功能'}
        </p>
        <strong>TBD: The Brilliant Discovery!</strong>
      </div>
      <code>{props.onChange ?? 'ohh !...'}</code>
      {children}
      {/* This is index.tsx} */}
    </>
  );
}

export default Bug1836;
