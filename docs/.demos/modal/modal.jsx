/**
 * title: Basic Modal
 * title.zh-CN: 基础 Modal
 * desc: This is a basic example of the antd Modal component
 * desc.zh-CN: 这是 antd Modal 组件的基础示例
 */

import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import ModalContent from './content';
import './modal.less';

const App = () => {
  const [visible, setVisible] = useState(false);

  const showModal = () => {
    setVisible(true);
  };

  const handleOk = e => {
    console.log(e);
    setVisible(false);
  };

  const handleCancel = e => {
    console.log(e);
    setVisible(false);
  };

  return (
    <div>
      <Button type="primary" onClick={showModal}>
        Open Modal
      </Button>
      <Modal
        title="Basic Modal"
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        className="example-modal-content"
      >
        <ModalContent />
      </Modal>
    </div>
  );
};

export default () => <App />;
