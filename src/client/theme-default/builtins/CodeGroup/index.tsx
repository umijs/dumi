import React, { useEffect, useRef, useState } from 'react';
import './index.less';

interface CodeGroupChildrenProps {
  label: string;
  children: React.ReactNode;
}

interface CodeGroupProps {
  children: React.ReactElement<CodeGroupChildrenProps>[];
}

const CodeGroup: React.FC<CodeGroupProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [linePosition, setLinePosition] = useState(0);

  const lineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLinePosition(52 * activeTab);
  }, [activeTab]);

  return (
    <>
      <div className="dumi-default-tabs" ref={lineRef}>
        {children?.map((child, index) => (
          <span
            key={index}
            className={index === activeTab ? 'active-tab tab' : 'tab'}
            onClick={() => setActiveTab(index)}
          >
            {child.props.label}
          </span>
        ))}
        <div className="line" style={{ left: linePosition }} />
      </div>
      <div className="tabs">{children?.[activeTab]}</div>
    </>
  );
};

export default CodeGroup;
