import type { IDumiTechStack } from '@/types';

export interface IDemoLoaderOptions {
  techStacks: IDumiTechStack[];
  cwd: string;
}

export default function demoLoader(this: any, raw: string) {
  const opts: IDemoLoaderOptions = this.getOptions();
  const techStackName = new URLSearchParams(this.resourceQuery).get(
    'techStack',
  );
  const techStack = opts.techStacks.find((t) => t.name === techStackName)!;

  return techStack.transformCode(raw, {
    type: 'external',
    fileAbsPath: this.resourcePath,
  });
}
