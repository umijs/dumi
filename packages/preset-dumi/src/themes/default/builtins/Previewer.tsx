/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { Component } from 'react';
import Clipboard from 'react-clipboard.js';
import innertext from 'innertext';
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
     * unformatted source code, exsits definitely
     */
    raw?: string;
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
}

class Previewer extends Component<IPreviewerProps> {
  state = {
    showSource: false,
    sourceType: '',
    copyTimer: null,
    jsBase64: '',
    tsBase64: '',
    showRiddle: false,
  };

  componentDidMount() {
    const { source, desc, title, dependencies: dep } = this.props;
    const { tsx = '', jsx = '', raw } = source;
    // generate csb base64 code;
    let tsData = {};
    let jsData = {};
    // tsx and jsx should have same dependencies, so only parse once

    if (tsx) {
      tsData = {
        files: {
          'index.html': {
            content: '<div style="margin: 16px;" id="root"></div>',
          },
          'demo.tsx': {
            content: raw,
          },
          'index.tsx': {
            content: `import React from 'react';
import ReactDOM from 'react-dom';
${dep.antd ? "import 'antd/dist/antd.css';" : ''}
import App from './demo';

${issueLink}`,
          },
        },
        deps: {
          ...dep,
          react: '^16.8.0',
          '@babel/runtime': '^7.6.3',
        },
        devDependencies: {
          typescript: '3.3.3',
        },
        desc: innertext(desc || ''),
        template: 'create-react-app-typescript',
        fileName: 'demo.tsx',
      };
    }
    if (jsx) {
      jsData = {
        files: {
          'index.html': {
            content: '<div style="margin: 16px;" id="root"></div>',
          },
          'demo.jsx': {
            content: raw,
          },
          'index.js': {
            content: `import React from 'react';
import ReactDOM from 'react-dom';
${dep.antd ? "import 'antd/dist/antd.css';" : ''}
import App from './demo';

${issueLink}`,
          },
        },
        deps: {
          ...dep,
          react: '^16.8.0',
          '@babel/runtime': '^7.6.3',
        },
        devDependencies: {
          typescript: '3.3.3',
        },
        desc: innertext(desc || ''),
        template: 'create-react-app',
        fileName: 'demo.jsx',
      };
    }

    const jsBase64 = finaliseCSB(jsData, { name: title || 'dumi-demo' }).parameters;
    const tsBase64 = finaliseCSB(tsData, { name: title || 'dumi-demo' }).parameters;

    // prioritize display tsx
    this.setState({ sourceType: tsx ? 'tsx' : 'jsx', jsBase64, tsBase64 });

    // detect network via img request
    const img = document.createElement('img');

    img.onload = () => {
      this.setState({ showRiddle: true });
    };

    img.src =
      'https://private-alipayobjects.alipay.com/alipay-rmsdeploy-image/rmsportal/RKuAiriJqrUhyqW.png';
  }

  handleCopied = () => {
    clearTimeout(this.state.copyTimer);
    this.setState({
      copyTimer: setTimeout(() => {
        this.setState({ copyTimer: null });
      }, 2000),
    });
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
    } = this.props;
    const { showSource, sourceType, copyTimer, jsBase64, tsBase64, showRiddle } = this.state;

    // render directly for inline mode
    if (inline) {
      return children;
    }

    return (
      <div className="__dumi-default-previewer">
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
          dangerouslySetInnerHTML={{ __html: desc }}
        />
        <div className="__dumi-default-previewer-actions">
          <CsbButton
            type={this.props.source.tsx ? 'tsx' : 'jsx'}
            base64={this.props.source.tsx ? tsBase64 : jsBase64}
          >
            <button role="codesandbox" type="submit" />
          </CsbButton>
          {showRiddle && (
            <form
              action="//riddle.alibaba-inc.com/riddles/define"
              method="POST"
              target="_blank"
              style={{ display: 'flex' }}
            >
              <button role="riddle" type="submit" />
              <input
                type="hidden"
                name="data"
                value={JSON.stringify({
                  title,
                  js: this.convertRiddleJS(source.raw),
                  css: dependencies.antd
                    ? `@import 'antd${`@${dependencies.antd}`}/dist/antd.css';`
                    : '',
                })}
              />
            </form>
          )}
          {path && (
            <a target="_blank" rel="noopener noreferrer" href={path}>
              <button role="open-demo" type="button" />
            </a>
          )}
          <span />
          <Clipboard
            button-role={copyTimer ? 'copied' : 'copy'}
            data-clipboard-text={source.raw}
            onSuccess={this.handleCopied}
          />
          {source.tsx && showSource && (
            <button
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
            role="source"
            type="button"
            onClick={() => this.setState({ showSource: !showSource })}
          />
        </div>
        {showSource && (
          <div
            className="__dumi-default-previewer-source"
            dangerouslySetInnerHTML={{ __html: source[sourceType] }}
          />
        )}
      </div>
    );
  }
}

export default localePropsHoc(Previewer);
