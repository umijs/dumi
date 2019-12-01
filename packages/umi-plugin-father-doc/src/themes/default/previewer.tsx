import { Component } from 'react';
import Clipboard from 'react-clipboard.js'
import './previewer.less';

export interface IPreviewerProps {
  /**
   * 当前 Demo 的源代码
   */
  source?: {
    /**
     * 未经 prism 格式化前的源代码，必定存在
     */
    raw?: string;
    /**
     * jsx 形式的源代码，必定存在
     */
    jsx: string;
    /**
     * tsx 形式的源代码，仅在源码语言为 tsx 时存在
     */
    tsx?: string;
  };
  /**
   * 当前 demo 的标题
   */
  title?: string;
  /**
   * 当前 demo 的介绍
   */
  desc?: string;
}

export default class Previewer extends Component<IPreviewerProps> {
  state = {
    showSource: false,
    sourceType: '',
    copyTimer: null,
  }

  componentDidMount() {
    const { source } = this.props;

    // prioritize display tsx
    this.setState({ sourceType: source.tsx ? 'tsx' : 'jsx' });
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
    const { children, source, title, desc } = this.props;
    const { showSource, sourceType, copyTimer } = this.state;

    return (
      <div className="__father-doc-default-previewer">
        <div className="__father-doc-default-previewer-demo">
          {children}
        </div>
        <div className="__father-doc-default-previewer-desc" title={title}>
          {desc}
        </div>
        <div className="__father-doc-default-previewer-actions">
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
