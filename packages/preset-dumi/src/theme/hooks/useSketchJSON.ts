import React, { useState } from 'react';
import { message } from 'antd';

import copy from 'copy-to-clipboard';
import { nodeToGroup, nodeToSketchSymbol } from 'html2sketch';

declare global {
  interface Window {
    DUMI_HTML2SKETCH: {
      nodeToSketchSymbol: any;
      nodeToGroup: any;
    };
  }
}

window.DUMI_HTML2SKETCH = {
  nodeToSketchSymbol,
  nodeToGroup,
};

const useSketchJSON = () => {
  const [timer, setTimer] = useState<NodeJS.Timeout>();

  const [groupJSON, setGroupJSON] = useState<object>();
  const [symbolJSON, setSymbolJSON] = useState<object>();
  const [copySymbol, setCopySymbol] = useState<'ready' | 'copied' | 'failed'>('ready');
  const [copyGroup, setCopyGroup] = useState<'ready' | 'copied' | 'failed'>('ready');

  const copySymbolJSON = data => {
    copy(JSON.stringify(data));
    setSymbolJSON(data);

    setCopySymbol('copied');
    clearTimeout(timer);
    setTimer(
      setTimeout(() => {
        setCopySymbol('ready');
      }, 2000),
    );
  };

  const copyGroupJSON = data => {
    copy(JSON.stringify(data));
    setGroupJSON(data);
    setCopyGroup('copied');

    clearTimeout(timer);
    setTimer(
      setTimeout(() => {
        setCopyGroup('ready');
      }, 2000),
    );
  };

  return {
    symbolJSON,
    groupJSON,
    generateSymbol: (elements: Element | Element[]) => {
      try {
        if (elements instanceof Array) {
          const objects: Object[] = [];

          Array.from(elements).forEach(el => {
            const sketchJSON = nodeToSketchSymbol(el).toSketchJSON();
            objects.push(sketchJSON);
          });
          copySymbolJSON(objects);
        } else {
          const sketchJSON = nodeToSketchSymbol(elements).toSketchJSON();
          copySymbolJSON(sketchJSON);
        }
      } catch (e) {
        setCopySymbol('failed');
        console.error('解析失败,配置项可能存在错误!');
        console.error(e);
      }
    },
    generateGroup: (elements: Element | Element[]) => {
      try {
        const objects: Object[] = [];
        if (elements instanceof Array) {
          Array.from(elements).forEach(el => {
            const sketchJSON = nodeToGroup(el).toSketchJSON();
            objects.push(sketchJSON);
          });
          copyGroupJSON(objects);
        } else {
          const sketchJSON = nodeToGroup(elements).toSketchJSON();
          copyGroupJSON(sketchJSON);
        }
      } catch (e) {
        setCopyGroup('failed');
        console.error('解析失败,配置项可能存在错误!');
        console.error(e);
      }
    },
    copySymbolStatus: copySymbol,
    copyGroupStatus: copyGroup,
  };
};

export default useSketchJSON;
