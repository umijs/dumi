import React, { type FC } from 'react';

export const Foo: FC<{
  /**
   * @description 属性描述
   * @default "默认值"
   */
  title?: string;
}> = ({ title }) => <h1>{title}</h1>;
