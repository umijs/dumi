import { IDepAnalyzeResult } from '../transformer/demo/dependencies';

export { default as context } from './context';
export { default as Link } from './components/Link';
export { default as NavLink } from './components/NavLink';
export { default as AnchorLink } from './components/AnchorLink';
export { default as useSearch } from './hooks/useSearch';
export { default as useCopy } from './hooks/useCopy';
export { default as useRiddle } from './hooks/useRiddle';
export { default as useCodeSandbox } from './hooks/useCodeSandbox';
export { default as useLocaleProps } from './hooks/useLocaleProps';

export interface IPreviewerComponentProps {
  title?: string;
  description?: string;
  sources:
    | {
        /**
         * self source code for demo
         * @note  jsx exsits definitely, tsx exists when the source code language is tsx
         */
        _: { jsx: string; tsx?: string };
      }
    | {
        /**
         * other file source code which imported in demo
         */
        [key: string]: {
          import: string;
          content: string;
          // reserved for transform JSX for other TypeScript file
          tsx?: string;
        };
      };
  /**
   * third-party dependencies of demo
   */
  dependencies: IDepAnalyzeResult['dependencies'];
  /**
   * global identifier for demo
   */
  identifier: string;
  /**
   * the component which demo belongs to
   */
  componentName?: string;
  [key: string]: any;
}
