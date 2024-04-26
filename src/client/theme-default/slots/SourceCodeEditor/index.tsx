import SourceCode from 'dumi/theme/builtins/SourceCode';
import React, {
  CSSProperties,
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
  onChange?: (code: string) => void;
}

/**
 * simple source code editor based on textarea
 */
const SourceCodeEditor: FC<ISourceCodeEditorProps> = (props) => {
  const elm = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>();
  const [code, setCode] = useState(props.initialValue);

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
        textarea={
          style && (
            <textarea
              className="dumi-default-source-code-editor-textarea"
              style={style}
              value={code}
              onChange={(ev) => {
                setCode(ev.target.value);
                props.onChange?.(ev.target.value);
                // FIXME: remove before publish
                props.onTranspile?.({ err: null, code: ev.target.value });
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
          )
        }
        extra={style && props.extra}
      >
        {code}
      </SourceCode>
    </div>
  );
};

export default SourceCodeEditor;
