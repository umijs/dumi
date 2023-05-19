import { ReactComponent as FileOutlined } from '@ant-design/icons-svg/inline-svg/outlined/file.svg';
import { ReactComponent as FolderOpenOutlined } from '@ant-design/icons-svg/inline-svg/outlined/folder-open.svg';
import { ReactComponent as FolderOutlined } from '@ant-design/icons-svg/inline-svg/outlined/folder.svg';
import { ReactComponent as MinusSquareOutlined } from '@ant-design/icons-svg/inline-svg/outlined/minus-square.svg';
import { ReactComponent as PlusSquareOutlined } from '@ant-design/icons-svg/inline-svg/outlined/plus-square.svg';
import type {
  CSSMotionProps,
  MotionEndEventHandler,
  MotionEventHandler,
} from 'rc-motion';
import type { MotionEvent } from 'rc-motion/lib/interface';
import type { TreeNodeProps, TreeProps } from 'rc-tree';
import Tree from 'rc-tree';
import type { DataNode, EventDataNode } from 'rc-tree/lib/interface';
import type { ComponentProps, ReactNode } from 'react';
import React, { createRef, useEffect, useState } from 'react';
import './index.less';

function getTreeFromList(nodes: ReactNode, prefix = '') {
  const data: TreeProps['treeData'] = [];

  ([] as ReactNode[]).concat(nodes).forEach((node, i) => {
    const key = `${prefix ? `${prefix}-` : ''}${i}`;

    switch (node?.type) {
      case 'ul': {
        const parent = data[data.length - 1]?.children || data;
        const ulLeafs = getTreeFromList(node.props.children || [], key);

        parent.push(...ulLeafs);
        break;
      }

      case 'li': {
        const liLeafs = getTreeFromList(node.props.children, key);

        data.push({
          title: ([] as ReactNode[])
            .concat(node.props.children)
            .filter((child) => child.type !== 'ul'),
          key,
          children: liLeafs,
          isLeaf: !liLeafs.length,
        });
        break;
      }

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

const getIcon = (props: TreeNodeProps<DataNode>) => {
  const { isLeaf, expanded } = props;
  if (isLeaf) {
    return (
      <span className="dumi-default-tree-icon">
        <FileOutlined fill="currentColor" />
      </span>
    );
  }
  return expanded ? (
    <span className="dumi-default-tree-icon">
      <FolderOpenOutlined fill="currentColor" />
    </span>
  ) : (
    <span className="dumi-default-tree-icon">
      <FolderOutlined fill="currentColor" />
    </span>
  );
};

const renderSwitcherIcon = (props: TreeNodeProps<DataNode>) => {
  const { isLeaf, expanded } = props;
  if (isLeaf) {
    return <span className={`tree-switcher-leaf-line`} />;
  }
  return expanded ? (
    <span className={`tree-switcher-line-icon`}>
      <span className="dumi-default-tree-icon">
        <MinusSquareOutlined fill="currentColor" />
      </span>
    </span>
  ) : (
    <span className={`tree-switcher-line-icon`}>
      <span className="dumi-default-tree-icon">
        <PlusSquareOutlined fill="currentColor" />
      </span>
    </span>
  );
};

// ================== Collapse Motion ==================
const getCollapsedHeight: MotionEventHandler = () => ({
  height: 0,
  opacity: 0,
});
const getRealHeight: MotionEventHandler = (node) => {
  const { scrollHeight } = node;
  return { height: scrollHeight, opacity: 1 };
};
const getCurrentHeight: MotionEventHandler = (node) => ({
  height: node ? node.offsetHeight : 0,
});
const skipOpacityTransition: MotionEndEventHandler = (_, event: MotionEvent) =>
  event?.deadline === true ||
  (event as TransitionEvent).propertyName === 'height';

const initCollapseMotion: CSSMotionProps = {
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

  const onClick = (
    event: React.MouseEvent<HTMLElement>,
    node: EventDataNode<any>,
  ) => {
    const { isLeaf } = node;

    if (isLeaf || event.shiftKey || event.metaKey || event.ctrlKey) {
      return;
    }
    treeRef.current!.onNodeExpand(event as any, node);
  };

  return (
    <Tree
      className="dumi-default-tree"
      icon={getIcon}
      ref={treeRef}
      itemHeight={20}
      showLine={true}
      selectable={false}
      virtual={false}
      motion={{
        ...initCollapseMotion,
        motionAppear: false,
      }}
      onClick={onClick}
      treeData={[{ key: '0', title: props.title || '<root>', children: data }]}
      defaultExpandAll
      switcherIcon={renderSwitcherIcon}
    />
  );
};
