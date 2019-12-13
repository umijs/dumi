import { Component } from 'react';
import Clipboard from 'react-clipboard.js'
import finaliseCSB, { parseImport, issueLink } from '../../utils/codesandbox';
import './previewer.less';
import CsbButton from './csbButton';

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
}

export default class Previewer extends Component<IPreviewerProps> {
  state = {
    showSource: false,
    sourceType: '',
    copyTimer: null,
    jsBase64: '',
    tsBase64: '',
  }

  componentDidMount() {
    const { source, desc, title } = this.props;
    const { tsx = '', jsx = '', raw } = source;
    // generate csb base64 code;
    let tsData = {};
    let jsData = {};
    // tsx and jsx should have same dependencies, so only parse once
    const dep = parseImport(raw);

    if(tsx) {
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
        desc,
        template: 'create-react-app-typescript',
        fileName: 'demo.tsx',
      }
    }
    if(jsx) {
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
        desc,
        template: 'create-react-app',
        fileName: 'demo.jsx',
      };
    }
    
    const jsBase64 = finaliseCSB( jsData, { name: title || 'father-doc-demo' }).parameters;
    const tsBase64 = finaliseCSB( tsData, { name: title || 'father-doc-demo' }).parameters;

    // prioritize display tsx
    this.setState({ sourceType: tsx ? 'tsx' : 'jsx', jsBase64, tsBase64 });

  }

  handleCopied = () => {
    clearTimeout(this.state.copyTimer);
    this.setState({
      copyTimer: setTimeout(() => {
        this.setState({ copyTimer: null });
      }, 2000),
    });
  }

  render() {
    const { children, source, title, desc, inline } = this.props;
    const { showSource, sourceType, copyTimer, jsBase64, tsBase64 } = this.state;

    // render directly for inline mode
    if (inline) {
      return children;
    }

    return (
      <div className="__father-doc-default-previewer">
        <div className="__father-doc-default-previewer-demo">
          {children}
        </div>
        <div className="__father-doc-default-previewer-desc" title={title}>
          {desc}
        </div>
        <div className="__father-doc-default-previewer-actions">
          <CsbButton type={this.props.source.tsx ? 'tsx' : 'jsx'} base64={this.props.source.tsx ? tsBase64 : jsBase64} >
            <button
              role='codesandbox'
              type="submit"
            />
          </CsbButton>
          <span />
          <Clipboard
            button-role={copyTimer ? 'copied' : 'copy'}
            data-clipboard-text={source.raw}
            onSuccess={this.handleCopied}
          />
          {source.tsx && showSource && (
            <button
              role={`change-${sourceType}`}
              onClick={() => this.setState({
                sourceType: sourceType === 'tsx' ? 'jsx' : 'tsx',
              })}
            />
          )}
          <button
            role="source"
            onClick={() => this.setState({ showSource: !showSource })}
          />
        </div>
        {showSource && (
          <div
            className="__father-doc-default-previewer-source"
            dangerouslySetInnerHTML={{ __html: source[sourceType] }}
          />
        )}
      </div>
    );
  }
}
