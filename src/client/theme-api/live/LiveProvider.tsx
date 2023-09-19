import { evalCode } from 'dumi';
import React, { FC, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/server';
import { transform } from 'sucrase';
import { useDemoScopes } from './useDemoScopes';

type LiveContextProps = {
  enabled: boolean;
  code: string;
  onCodeChange: (code: string) => void;
  demo: React.ReactNode;
  error: string;
};

export const LiveContext = React.createContext<LiveContextProps>({
  enabled: false,
  code: '',
  onCodeChange: () => {},
  demo: null,
  error: '',
});

export type LiveProviderProps = {
  initialCode: string;
  demoId: string;
  children: React.ReactElement;
};

const transformCode = (code: string, scopes: any) => {
  const Comp = evalCode(
    transform(code, { transforms: ['typescript', 'jsx'] }).code,
    scopes,
  );

  return <Comp />;
};

export const LiveProvider: FC<LiveProviderProps> = ({
  initialCode,
  demoId,
  children,
}) => {
  const scopes = useDemoScopes(demoId);
  const [code, setCode] = useState<string>(initialCode);
  const [demo, setDemo] = useState<React.ReactNode>(() =>
    transformCode(code, scopes),
  );
  const [error, setError] = useState<string>('');

  const onCodeChange = (newCode: string) => {
    setCode(newCode);
    try {
      const liveDemo = transformCode(newCode, scopes);
      ReactDOM.renderToString(liveDemo);
      setDemo(liveDemo);
      setError('');
    } catch (e: any) {
      setError(e.message);
    }
  };

  const contextValue = useMemo<LiveContextProps>(() => {
    return {
      error,
      enabled: scopes !== null,
      demo,
      code,
      onCodeChange,
    };
  }, [code, scopes, demo, error]);

  if (!scopes) {
    return children;
  }

  return (
    <LiveContext.Provider value={contextValue}>{children}</LiveContext.Provider>
  );
};

export default LiveProvider;
