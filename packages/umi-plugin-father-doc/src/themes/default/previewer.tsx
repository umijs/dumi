// Todo: fix definition files cannot be identified problem
/// <reference path="../typings/typings.d.ts" />
import { Component } from 'react';
import styles from './previewer.less';

export interface IPreviewerProps {
  /**
   * 当前 Demo 的源代码
   */
  source?: {
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
  render() {
    const { children, source } = this.props;

    return (
      <div className={styles.wrapper}>
        {children}
        {source && (
          <div className={styles.source}>
            <div
              className={styles.sourcePanel}
              dangerouslySetInnerHTML={{ __html: source.jsx }}
            />
            {source.tsx && (
              <div
                className={styles.sourcePanel}
                dangerouslySetInnerHTML={{ __html: source.tsx }}
              />
            )}
          </div>
        )}
      </div>
    );
  }
}
