// @ts-ignore
import { Link } from 'dumi';
import React, { type FC } from 'react';
import './index.less';

const Hero: FC = () => (
  <div className="dumi-tmp-hero">
    <h1>
      dumi 2<small>Beta</small>
    </h1>
    <p>为组件研发而生的静态站点框架，现已进入 Beta 测试阶段，欢迎试用尝鲜</p>
    <p>注：Beta 版尚不稳定，功能也可能会有调整，请谨慎用于正式项目</p>
    <Link to="/guide">抢先体验</Link>
  </div>
);

export default Hero;
