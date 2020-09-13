import { useState } from 'react';
import copy from 'copy-text-to-clipboard';
import { nodeToGroup, nodeToSketchSymbol } from 'html2sketch';

declare global {
  interface Window {
    DUMI_HTML2SKETCH: {
      nodeToSketchSymbol: any;
      nodeToGroup: any;
    };
  }
}

if (typeof window !== 'undefined') {
  window.DUMI_HTML2SKETCH = {
    nodeToSketchSymbol,
    nodeToGroup,
  };
}

const useSketchJSON = () => {
  const [groupTimer, setGroupTimer] = useState<NodeJS.Timeout>();
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

    clearTimeout(groupTimer);
    setGroupTimer(
      setTimeout(() => {
        setCopyGroup('ready');
      }, 2000),
    );
  };

  return {
    symbolJSON,
    groupJSON,
    generateSymbol: async (elements: Element | Element[]) => {
      try {
        if (elements instanceof Array) {
          const objects: Object[] = [];

          for (let i = 0; i < elements.length; i += 1) {
            const el = elements[i];
            // eslint-disable-next-line no-await-in-loop
            const symbol = await nodeToSketchSymbol(el);
            const sketchJSON = symbol.toSketchJSON();
            objects.push(sketchJSON);
          }

          copySymbolJSON(objects);
        } else {
          const symbol = await nodeToSketchSymbol(elements);
          const sketchJSON = symbol.toSketchJSON();
          copySymbolJSON(sketchJSON);
        }
      } catch (e) {
        setCopySymbol('failed');
        console.error('解析失败,配置项可能存在错误!');
        console.error(e);
      }
    },
    generateGroup: async (elements: Element | Element[]) => {
      try {
        const objects: Object[] = [];
        if (elements instanceof Array) {
          for (let i = 0; i < elements.length; i += 1) {
            const el = elements[i];
            // eslint-disable-next-line no-await-in-loop
            const group = await nodeToGroup(el);
            const sketchJSON = group.toSketchJSON();
            objects.push(sketchJSON);
          }
          copyGroupJSON(objects);
        } else {
          const group = await nodeToGroup(elements);
          const sketchJSON = group.toSketchJSON();
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
