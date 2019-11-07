import remark from './remark';

export interface TransformResult {
  content: string;
  config: {
    frontmatter: { [key: string]: any };
    [key: string]: any;
  };
}

export default {
  markdown(raw: string, dir: string): TransformResult {
    const result = remark(raw, dir);

    return {
      content: `export default function () {
        return (
          <div>${result.contents}</div>
        )
      }`,
      config: {
        frontmatter: {},
        ...result.data as TransformResult['config'],
      },
    };
  }
}
