import { evalCode, useDemoScopes } from 'dumi';
import { highlight, languages } from 'prismjs';
import React, { FC, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import Editor from 'react-simple-code-editor';
import { transform } from 'sucrase';

const LiveDemo: FC<{ code: string; scopes: any }> = ({ code, scopes }) => {
  const Demo = evalCode(
    transform(code, { transforms: ['typescript', 'jsx'] }).code,
    scopes,
  );

  return <Demo />;
};

export const useLive = (
  id: string,
  initialCode: string,
): {
  liveDemo?: React.ReactNode;
  editor?: React.ReactNode;
} => {
  const [code, setCode] = useState(initialCode);
  const scopes = useDemoScopes(id);

  if (!scopes) {
    return {};
  }

  return {
    liveDemo: (
      <ErrorBoundary fallback={<div>Compiling</div>}>
        <LiveDemo code={code} scopes={scopes} />
      </ErrorBoundary>
    ),
    editor: (
      <Editor
        value={code}
        onValueChange={(code) => setCode(code)}
        highlight={(code) => highlight(code, languages.js, 'tsx')}
        padding={20}
      />
    ),
  };
};
