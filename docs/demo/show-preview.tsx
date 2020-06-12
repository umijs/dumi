/**
 * title: 左下角按钮显示隐藏
 */

import React from 'react';
import { Button } from 'antd';

type MsgType = string;

function hello(msg: MsgType) {
  alert(msg);
}

export default () => (
  <Button type="primary" onClick={hello.bind(null, 'Halo!')}>
    点击我就 Halo!
  </Button>
);
