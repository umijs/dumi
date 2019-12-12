import { Component } from 'react';
import Clipboard from 'react-clipboard.js'
import './previewer.less';

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
    const { children, source, title, desc, inline } = this.props;
    const { showSource, sourceType, copyTimer } = this.state;

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
