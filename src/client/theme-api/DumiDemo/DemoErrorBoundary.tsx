import Container from 'dumi/theme/builtins/Container';
import React, { type FC, type ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const DemoErrorBoundary: FC<{ children: ReactNode }> = (props) => (
  <ErrorBoundary
    fallbackRender={({ error }: any) => (
      <Container type="error">
        <p>
          <strong>{error.message || 'This demo has been crashed.'}</strong>
        </p>
        {error.stack && (
          <p>
            <details open>
              <summary>Error stack</summary>
              <pre>{error.stack}</pre>
            </details>
          </p>
        )}
      </Container>
    )}
  >
    {props.children}
  </ErrorBoundary>
);

export default DemoErrorBoundary;
