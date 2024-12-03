import type { VNodeChild } from 'vue';
import { Mut, VueComponent, type ComponentProps } from 'vue3-oop';

export interface ClassCountProps {
  /**
   * @type T
   * @description 数据源
   */
  data?: Array<number>;
  /**
   * 默认数量
   */
  initValue?: number;

  /**
   * @description 点击事件
   */
  onClick?: () => Promise<string>;

  slots: {
    icon: ({ name }: { name: number[] }) => VNodeChild;
  };
}

export class ClassCount<T> extends VueComponent<ClassCountProps> {
  static defaultProps: ComponentProps<ClassCountProps> = [
    'initValue',
    'onClick',
    'data',
  ];

  @Mut() count = this.props.initValue;
  /**
   * foo方法
   * @public
   */
  foo(name: string) {}

  render() {
    return (
      <div style={{ accentColor: 'green' }}>
        <h2>我是类组件</h2>
        <button style={{ marginBottom: '20px' }} onClick={() => this.count++}>
          增加
        </button>
        <div
          style={
            'display:grid;place-items: center;height: 200px; background-color:yellow;'
          }
        >
          <div style="background-color:red;color: #fff;padding: 10px;">
            居中: {this.count}
          </div>
        </div>
      </div>
    );
  }
}
