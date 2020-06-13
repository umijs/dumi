/**
 * title: 通过code标签引入
 * desc: 设置 hideAction 属性，例：hideActions='["CSB", "EXTERNAL"]'
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
