/**
 * Test importing markdown file
 * @see: https://github.com/umijs/dumi/pull/2281
 */
import React from 'react';
// @ts-ignore
import NormalMarkdown from './normal.md';

function InternalTest() {
  return (
    <div>
      <h1>Internal Test</h1>
      <NormalMarkdown />
    </div>
  );
}

export default InternalTest;
