import type React from 'react';

interface IA1Props {
  type: 'primary';
  className?: string;
}

interface IA2Props {
  type: 'link';
  href: string;
  className?: string;
}

type IAProps = IA1Props | IA2Props;

const A: React.FC<IAProps> = () => null;

export default A;
