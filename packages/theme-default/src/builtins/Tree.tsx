import React, { useEffect, useState, ReactNode, createRef, ComponentProps } from 'react';
import  Tree, { TreeProps } from 'rc-tree';
import { EventDataNode } from 'rc-tree/lib/interface';
import { CSSMotionProps, MotionEventHandler, MotionEndEventHandler } from 'rc-motion';
import FileOutlined from '@ant-design/icons/FileOutlined';
import FolderOpenOutlined from '@ant-design/icons/FolderOpenOutlined';
import FolderOutlined from '@ant-design/icons/FolderOutlined';
import MinusSquareOutlined from '@ant-design/icons/MinusSquareOutlined';
import PlusSquareOutlined from '@ant-design/icons/PlusSquareOutlined';
import 'rc-tree/assets/index.less'
import './Tree.less';

function getTreeFromList(nodes: ReactNode, prefix = '') {
  const data: TreeProps['treeData'] = [];

  [].concat(nodes).forEach((node, i) => {
    const key = `${prefix ? `${prefix}-` : ''}${i}`;

    switch (node.type) {
      case 'ul':
        const parent = data[data.length - 1]?.children || data;
        const ulLeafs = getTreeFromList(node.props.children || [], key);

        parent.push(...ulLeafs);
        break;

      case 'li':
        const liLeafs = getTreeFromList(node.props.children, key);

        data.push({
          title: [].concat(node.props.children).filter(child => child.type !== 'ul'),
          key,
          children: liLeafs,
          isLeaf: !liLeafs.length,
        });
        break;

      default:
    }
  });

  return data;
}

const useListToTree = (nodes: ReactNode) => {
  const [tree, setTree] = useState(getTreeFromList(nodes));

  useEffect(() => {
    setTree(getTreeFromList(nodes));
  }, [nodes]);

  return tree;
};

const getIcon = (props) => {
  const { isLeaf, expanded } = props;
  if (isLeaf) {
    return <FileOutlined />;
  }
  return expanded ? <FolderOpenOutlined /> : <FolderOutlined />;
}

const renderSwitcherIcon = (props) => {
  const { isLeaf, expanded } = props;
  if (isLeaf) {
    return <span className={`tree-switcher-leaf-line`} />;
  }
  return expanded ? (
    <MinusSquareOutlined className={`tree-switcher-line-icon`} />
  ) : (
    <PlusSquareOutlined className={`tree-switcher-line-icon`} />
  );
}

// ================== Collapse Motion ==================
const getCollapsedHeight: MotionEventHandler = () => ({ height: 0, opacity: 0 });
const getRealHeight: MotionEventHandler = node => ({ height: node.scrollHeight, opacity: 1 });
const getCurrentHeight: MotionEventHandler = node => ({ height: node.offsetHeight });
const skipOpacityTransition: MotionEndEventHandler = (_, event) =>
  (event as TransitionEvent).propertyName === 'height';

const collapseMotion: CSSMotionProps = {
  motionName: 'ant-motion-collapse',
  onAppearStart: getCollapsedHeight,
  onEnterStart: getCollapsedHeight,
  onAppearActive: getRealHeight,
  onEnterActive: getRealHeight,
  onLeaveStart: getCurrentHeight,
  onLeaveActive: getCollapsedHeight,
  onAppearEnd: skipOpacityTransition,
  onEnterEnd: skipOpacityTransition,
  onLeaveEnd: skipOpacityTransition,
  motionDeadline: 500,
};

export default (props: ComponentProps<'div'>) => {
  const data = useListToTree(props.children);

  const treeRef = createRef<Tree>();

  const onClick = (event: React.MouseEvent<HTMLElement>, node: EventDataNode) =>{
    const { isLeaf } = node;

    if (isLeaf || event.shiftKey || event.metaKey || event.ctrlKey) {
      return;
    }
    treeRef.current!.onNodeExpand(event as any, node);
  };

  return (
    <Tree
      className="__dumi-site-tree"
      icon={getIcon}
      ref={treeRef}
      itemHeight={20}
      showLine={true}
      selectable={false}
      motion={{
        ...collapseMotion,
        motionAppear: false
      }}
      onClick={onClick}
      treeData={[{ key: '0', title: props.title || '<root>', children: data }]}
      defaultExpandAll
      switcherIcon={renderSwitcherIcon}
    />
  );
};
