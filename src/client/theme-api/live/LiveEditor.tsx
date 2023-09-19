import { highlight, languages } from 'prismjs';
import React, { FC, useContext } from 'react';
import Editor from 'react-simple-code-editor';
import { LiveContext } from './LiveProvider';

const LiveEditor: FC = () => {
  const { code, onCodeChange } = useContext(LiveContext);

  return (
    <Editor
      value={code}
      onValueChange={onCodeChange}
      highlight={(code) => highlight(code, languages.js, 'tsx')}
      padding={20}
    />
  );
};

export default LiveEditor;
