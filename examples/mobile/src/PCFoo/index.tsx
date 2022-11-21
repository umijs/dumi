import React, { type FC } from 'react';

const Foo: FC<{
  /**
   * @description 标题
   */
  title: string;
  /**
   * @description 顺序
   */
  order?: number;
}> = (props) => {
  return <>{props.title}</>;
};

export default Foo;
