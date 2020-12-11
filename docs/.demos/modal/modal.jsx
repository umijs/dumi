/**
 * title: Basic Modal
 * title.zh-CN: 基础 Modal
 * desc: This is a basic example of the antd Modal component
 * desc.zh-CN: 这是 antd Modal 组件的基础示例
 */

import React from 'react';
import { Button, Modal } from 'antd';
import ModalContent from './content';
import './modal.less';

class App extends React.Component {
  state = { visible: false };

  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  handleOk = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  render() {
    return (
      <div>
        <Button type="primary" onClick={this.showModal}>
          Open Modal
        </Button>
        <Modal
          title="Basic Modal"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          className="example-modal-content"
        >
          <ModalContent />
        </Modal>
      </div>
    );
  }
}

export default () => <App />;
