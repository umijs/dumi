import Card from 'antd-mobile/es/card';
import 'antd-mobile/es/card/style/index.less';
import WhiteSpace from 'antd-mobile/es/white-space';
import 'antd-mobile/es/white-space/style/index.less';
import WingBlank from 'antd-mobile/es/wing-blank';
import 'antd-mobile/es/wing-blank/style/index.less';
import React, { type FC } from 'react';

const Foo: FC = () => {
  return (
    // @ts-ignore
    <WingBlank size="lg">
      <WhiteSpace size="lg" />
      <Card>
        <Card.Header
          title="This is title"
          thumb="https://gw.alipayobjects.com/zos/rmsportal/MRhHctKOineMbKAZslML.jpg"
          extra={<span>this is extra</span>}
        />
        <Card.Body>
          <div>This is content of `Card`</div>
        </Card.Body>
        <Card.Footer
          content="footer content"
          extra={<div>extra footer content</div>}
        />
      </Card>
      <WhiteSpace size="lg" />
    </WingBlank>
  );
};

export default Foo;
