import { usePrefersColor } from 'dumi';
import React from 'react';
import type { SkeletonProps, SkeletonThemeProps } from 'react-loading-skeleton';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import './index.less';

const TitleSkeleton = (props: SkeletonProps) => (
  <Skeleton
    width={Math.floor(Math.random() * 200) + 120}
    height={24}
    {...props}
    className="title"
  />
);

const DescriptionSkeleton = () => (
  <div className="description">
    <Skeleton count={1} />
    <Skeleton count={Math.floor(Math.random() * 5)} />
    <Skeleton count={1} width="60%" />
  </div>
);

const CodeActionSkeleton = ({ count = 5, ...rest }: SkeletonProps) => (
  <Skeleton
    count={count}
    inline
    {...rest}
    className="code-action-item"
    width={20}
    height={20}
  />
);

const DemoBlockSkeleton = ({ children }: React.PropsWithChildren) => (
  <div className="demo-block">
    <div className="content">{children}</div>
    <div className="actions">
      <CodeActionSkeleton />
    </div>
  </div>
);

const Loading: React.FC = () => {
  const [currentPrefersColor] = usePrefersColor();

  const skeletonThemeProps = React.useMemo<SkeletonThemeProps>(() => {
    // light use default color
    let baseColor = undefined;
    let highlightColor = undefined;

    if (currentPrefersColor === 'dark') {
      baseColor = '#1f1f1f';
      highlightColor = 'rgba(255, 255, 255, 0.12)';
    }

    return {
      baseColor,
      highlightColor,
      // TODO: direction support
      direction: 'ltr',
    };
  }, [currentPrefersColor]);

  return (
    <div className="dumi-default-loading-skeleton">
      <SkeletonTheme {...skeletonThemeProps}>
        <TitleSkeleton />
        <DescriptionSkeleton />
        <DemoBlockSkeleton>
          <Skeleton height={10} />
          <Skeleton height={20} width="20%" />
          <Skeleton height={30} width="60%" />
        </DemoBlockSkeleton>
        <TitleSkeleton />
        <div className="demo-bock-guid">
          <DemoBlockSkeleton>
            <Skeleton height={10} />
            <Skeleton height={30} width="10%" />
            <Skeleton height={20} width="70%" />
          </DemoBlockSkeleton>
          <DemoBlockSkeleton>
            <Skeleton height={10} />
            <Skeleton height={20} width="50%" />
            <Skeleton height={30} width="30%" />
          </DemoBlockSkeleton>
        </div>
        <DescriptionSkeleton />
      </SkeletonTheme>
    </div>
  );
};

export default Loading;
