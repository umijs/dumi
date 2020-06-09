/**
 * title: 左下角按钮显示隐藏
 * desc: 设置 showCSB 显示或隐藏 codesandbox 按钮，设置 showPreview 显示或隐藏预览按钮，showCBSD 与 showPreview仅支持 code 引入，无法使用代码片段指定。
 * showCSB: true
 * showPreview: true
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
