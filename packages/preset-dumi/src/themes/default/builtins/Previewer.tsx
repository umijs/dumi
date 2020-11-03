/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { Component } from 'react';
import { Link } from 'umi';
import innertext from 'innertext';
import CopyButton from '../CopyButton';
import SourceCode from './SourceCode';
import finaliseCSB, { issueLink } from '../../../utils/codesandbox';
import localePropsHoc from '../localePropsHoc';
import CsbButton from '../csbButton';
import './Previewer.less';

export interface IPreviewerProps {
  /**
   * demo sources
   */
  source?: {
    /**
     * jsx source code, exsits definitely
     */
    jsx: string;
    /**
     * tsx source, exists when the source code language is tsx
     */
    tsx?: string;
  };
  /**
   * demo title
   */
  title?: string;
  /**
   * demo desc
   */
  desc?: string;
  /**
   * enable inline mode
   */
  inline?: true;
  /**
   * enable transform to change CSS containing block for demo
   */
  transform?: boolean;
  /**
   * modify background for demo area
   */
  background?: string;
  /**
   * collapse padding of demo area
   */
  compact?: string;
  /**
   * single route path (external demo only)
   */
  path?: string;
  /**
   * demo dependencies
   */
  dependencies: { [key: string]: string };
  /**
   * builtin CSS of demo dependencies, such as antd/dist/antd.css
   */
  CSSInDependencies: string[];
  /**
   * 1-level files that include by demo
   */
  files: {
    [key: string]: {
      path: string;
      content: string;
    };
  };
  /**
   * configurations for action button
   */
  hideActions: ('CSB' | 'EXTERNAL' | 'RIDDLE')[];
  /**
   * show source code by default
   */
  defaultShowCode?: boolean;
  className?: string;
}

class Previewer extends Component<IPreviewerProps> {
  state = {
    showSource: false,
    sourceType: '',
    // data for codesandbox
    CSBData: '',
    showRiddle: false,
    currentFile: '',
  };

  componentDidMount() {
    const { source, defaultShowCode = false } = this.props;

    // init data for codesandbox
    if (!this.props.hideActions?.includes('CSB')) {
      this.initCSBData();
    }

    // prioritize display tsx
    this.setState({ sourceType: source.tsx ? 'tsx' : 'jsx', showSource: defaultShowCode });

    if (!this.props.hideActions?.includes('RIDDLE')) {
      // detect network via img request
      const img = document.createElement('img');

      // interrupt image pending after 200ms
      setTimeout(() => {
        img.src = '';
      }, 200);

      img.onload = () => {
        this.setState({ showRiddle: true });
      };

      img.src =
        'https://private-alipayobjects.alipay.com/alipay-rmsdeploy-image/rmsportal/RKuAiriJqrUhyqW.png';
    }
  }

  initCSBData = () => {
    const { source, desc = '', title, dependencies, files, CSSInDependencies } = this.props;
    const isTSX = Boolean(source.tsx);
    const entryExt = isTSX ? 'tsx' : 'jsx';
    const CSBData = {
      files: {
        'index.html': {
          content: '<div style="margin: 16px;" id="root"></div>',
        },
        [`demo.${entryExt}`]: {
          content: source.tsx || source.jsx,
        },
        [`index.${entryExt}`]: {
          content: `import React from 'react';
import ReactDOM from 'react-dom';
${(CSSInDependencies || []).map(css => `import '${css}';`).join('\n')}
import App from './demo';

${issueLink}`,
        },
        ...files,
      },
      deps: {
        ...dependencies,
        react: '^16.8.0',
      },
      devDependencies: isTSX
        ? {
            typescript: '^3.8.0',
          }
        : {},
      desc: innertext(desc),
      template: `create-react-app${isTSX ? '-typescript' : ''}`,
      fileName: `demo.${entryExt}`,
    };

    this.setState({ CSBData: finaliseCSB(CSBData, { name: title || 'dumi-demo' }).parameters });
  };

  /**
   * transform local external dependencies
   */
  getSafeEntryCode = () => {
    const { source, files } = this.props;
    const result = source.tsx || source.jsx;

    // to avoid import from '../'
    Object.keys(files).forEach(safeName => {
      const file = files[safeName];

      result.replace(file.path, `./${safeName}`);
    });

    return result;
  };

  /**
   * convert source code for riddle
   */
  convertRiddleJS = (raw: string) => {
    const { dependencies } = this.props;
    let result = raw;

    // convert export default to ReactDOM.render for riddle
    result = result
      .replace('export default', 'const DumiDemo =')
      .concat('\nReactDOM.render(<DumiDemo />, mountNode);');

    // add version for dependencies
    result = result.replace(/(from ')((?:@[^/'"]+)?[^/'"]+)/g, (_, $1, $2) => {
      let dep = `${$1}${$2}`;

      if (dependencies[$2]) {
        dep += `@${dependencies[$2]}`;
      }

      return dep;
    });

    return result;
  };

  render() {
    const {
      children,
      source,
      title,
      desc,
      inline,
      transform,
      background,
      compact,
      path,
      dependencies,
      files,
      CSSInDependencies,
      ...props
    } = this.props;
    const { showSource, sourceType, showRiddle, currentFile } = this.state;
    const raw = source[sourceType];
    const hasExternalFile = Boolean(Object.keys(files).length);
    const sourceFileType = currentFile ? currentFile.match(/\.(\w+)$/)[1] : sourceType;

    // render directly for inline mode
    if (inline) {
      return children;
    }

    return (
      <div {...props} className={['__dumi-default-previewer', props.className].join(' ')}>
        <div
          className="__dumi-default-previewer-demo"
          style={{
            transform: transform ? 'translate(0, 0)' : undefined,
            padding: compact ? '0' : undefined,
            background,
          }}
        >
          {children}
        </div>
        <div
          className="__dumi-default-previewer-desc"
          title={title}
          // eslint-disable-next-line
          dangerouslySetInnerHTML={{ __html: desc }}
        />
        <div className="__dumi-default-previewer-actions">
          {!this.props.hideActions?.includes('EXTERNAL') && !hasExternalFile && (
            <>
              <CsbButton type={this.props.source.tsx ? 'tsx' : 'jsx'} base64={this.state.CSBData}>
                <button className="__dumi-default-icon" role="codesandbox" type="submit" />
              </CsbButton>
              {showRiddle && (
                <form
                  action="//riddle.alibaba-inc.com/riddles/define"
                  method="POST"
                  target="_blank"
                  style={{ display: 'flex' }}
                >
                  <button className="__dumi-default-icon" role="riddle" type="submit" />
                  <input
                    type="hidden"
                    name="data"
                    value={JSON.stringify({
                      title,
                      js: this.convertRiddleJS(raw),
                      css: (CSSInDependencies || []).map(css => `@import '${css}';`).join('\n'),
                    })}
                  />
                </form>
              )}
            </>
          )}
          {!this.props.hideActions?.includes('CSB') && path && (
            <Link target="_blank" to={path}>
              <button className="__dumi-default-icon" role="open-demo" type="button" />
            </Link>
          )}
          <span />
          <CopyButton text={files[currentFile]?.content || raw} />
          {source.tsx && showSource && !hasExternalFile && (
            <button
              className="__dumi-default-icon"
              role={`change-${sourceType}`}
              type="button"
              onClick={() =>
                this.setState({
                  sourceType: sourceType === 'tsx' ? 'jsx' : 'tsx',
                })
              }
            />
          )}
          <button
            className="__dumi-default-icon"
            role="source"
            type="button"
            onClick={() => this.setState({ showSource: !showSource })}
          />
        </div>
        {showSource && (
          <div className="__dumi-default-previewer-source-wrapper">
            {hasExternalFile && (
              <ul className="__dumi-default-previewer-source-tab">
                <li className={!currentFile ? 'active' : ''}>
                  <button type="button" onClick={() => this.setState({ currentFile: '' })}>
                    index.{sourceType}
                  </button>
                </li>
                {Object.keys(files).map(fileName => (
                  <li className={currentFile === fileName ? 'active' : ''} key={fileName}>
                    <button type="button" onClick={() => this.setState({ currentFile: fileName })}>
                      {fileName}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="__dumi-default-previewer-source">
              <SourceCode
                code={files[currentFile]?.content || raw}
                lang={sourceFileType as 'tsx' | 'jsx'}
                showCopy={false}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default localePropsHoc(Previewer);
