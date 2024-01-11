import { ApplyPluginsType, DumiDemoContext, useAppData } from 'dumi';
import SourceCode from 'dumi/theme/builtins/SourceCode';
import throttle from 'lodash.throttle';
import React, {
  CSSProperties,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type FC,
} from 'react';
import './index.less';

interface ISourceCodeEditorProps
  extends Omit<ComponentProps<typeof SourceCode>, 'children'> {
  initialValue: string;
  onTranspile?: (
    args: { err: Error; code?: null } | { err?: null; code: string },
  ) => void;
}

/**
 * simple source code editor based on textarea
 */
const SourceCodeEditor: FC<ISourceCodeEditorProps> = (props) => {
  const elm = useRef<HTMLDivElement>(null);
  const { pluginManager } = useAppData();
  const { demo } = useContext(DumiDemoContext);
  const [style, setStyle] = useState<CSSProperties>();
  const [code, setCode] = useState(props.initialValue);

  const runtimePlugin = demo?.runtime?.plugin;

  const compilerDefer = useRef<Promise<(...args: any) => string>>();

  const transpile = useCallback(
    throttle((value: string) => {
      compilerDefer.current
        ?.then((transform) => {
          props.onTranspile?.({
            code: transform(value, demo),
          });
        })
        .catch((err: any) => {
          props.onTranspile?.({ err });
        });
    }, 500),
    [props.onTranspile],
  );

  // generate style from pre element, for adapting to the custom theme
  useEffect(() => {
    const pre = elm.current?.querySelector('pre');

    if (pre) {
      const preStyle = window.getComputedStyle(pre);

      setStyle({
        fontSize: preStyle.fontSize,
        fontFamily: preStyle.fontFamily,
        lineHeight: preStyle.lineHeight,
        padding: preStyle.padding,
        margin: preStyle.margin,
      });
    } else {
      console.warn(
        '[dumi] pre element not found in SourceCode component, the SourceCodeEditor will be disabled, you can report an issue to dumi repository.',
      );
    }
  }, []);

  return (
    <div className="dumi-default-source-code-editor" ref={elm}>
      <SourceCode
        {...props}
        extra={
          style && (
            <>
              <textarea
                className="dumi-default-source-code-editor-textarea"
                style={style}
                value={code}
                onFocus={() => {
                  // load sucrase when focus on editor
                  if (!compilerDefer.current) {
                    if (runtimePlugin?.loadCompiler) {
                      compilerDefer.current = pluginManager.applyPlugins({
                        type: ApplyPluginsType.modify,
                        key: runtimePlugin.loadCompiler,
                      });
                    } else {
                      compilerDefer.current = import('sucrase').then(
                        ({ transform }) =>
                          (code: string) =>
                            transform(code, {
                              transforms: ['typescript', 'jsx', 'imports'],
                            }).code,
                      );
                    }
                  }
                }}
                onChange={(ev) => {
                  setCode(ev.target.value);
                  transpile(ev.target.value);
                }}
                onKeyDown={(ev) => {
                  // support tab to space
                  if (ev.key === 'Tab') {
                    ev.preventDefault();

                    const elm = ev.currentTarget;
                    const { selectionStart: start, selectionEnd: end } = elm;
                    const before = elm.value.substring(0, start);
                    const after = elm.value.substring(end);
                    const spaces = '  ';
                    const pos = spaces.length + start;

                    setCode(`${before}${spaces}${after}`);
                    setTimeout(() => {
                      elm.setSelectionRange(pos, pos);
                    });
                  }
                }}
                autoComplete="off"
                autoCorrect="off"
                autoSave="off"
              />
              {props.extra}
            </>
          )
        }
      >
        {code}
      </SourceCode>
    </div>
  );
};

export default SourceCodeEditor;
