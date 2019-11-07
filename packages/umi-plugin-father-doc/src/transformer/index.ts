import remark from './remark';

export interface TransformResult {
  content: string;
  config: { [key: string]: any };
}

export default {
  markdown(raw: string, dir: string): TransformResult {
    return {
      content: `export default function () {
        return (
          <div>${remark(raw, dir)}</div>
        )
      }`,
      config: {},
    };
  }
}
