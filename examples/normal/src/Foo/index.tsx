import React, { type FC } from 'react';

interface A {
  a: string;
}

interface SkipProps {
  skipProps1: string;
  skipProps2: number;
}

const Foo: FC<{
  /**
   * @description 标题
   * @default "标题"
   */
  title?: string;
  /**
   * @description 顺序
   */
  order?: number;
  a: A[];
  b: { c?: string };
  c: '1' | '2' | '3';
  d: 1 | 2 | 3;
  e: A | 1;
  f: { g?: string }[];
  onClick: (e?: MouseEvent) => void;
  children: React.ReactNode;
  onConfirm: (output: { children: any[] }) => void;
  dom: HTMLElement;
} & SkipProps> = (props) => {
  return <>{props.title}</>;
};

export default Foo;
