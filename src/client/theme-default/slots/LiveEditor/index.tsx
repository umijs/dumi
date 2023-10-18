import { LiveContext } from 'dumi';
import { highlight, languages } from 'prismjs';
import React, { ComponentProps, FC, useContext } from 'react';
import Editor from 'react-simple-code-editor';

const LiveEditor: FC<ComponentProps<typeof Editor>> = (props) => {
  const { code, onCodeChange } = useContext(LiveContext);

  return (
    <Editor
      {...props}
      value={code}
      onValueChange={onCodeChange}
      highlight={
        props.highlight ?? ((code) => highlight(code, languages.js, 'tsx'))
      }
      padding={props.padding ?? 20}
    />
  );
};

export default LiveEditor;
