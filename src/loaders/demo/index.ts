import { UTOOPACK_LOADER_CTX_KEY } from '@/features/compile/utoopackLoaders';
import type { IDumiTechStack } from '@/types';
import { winPath } from '@umijs/utils';
export interface IDemoLoaderOptions {
  techStacks: IDumiTechStack[];
  cwd: string;
}

export default function demoLoader(this: any, raw: string) {
  const opts: IDemoLoaderOptions & { [key: string]: any } = this.getOptions();

  let techStacks: IDumiTechStack[] = opts.techStacks;
  if (!techStacks && opts[UTOOPACK_LOADER_CTX_KEY]) {
    const ctx = require(opts[UTOOPACK_LOADER_CTX_KEY]) as {
      techStacks: IDumiTechStack[];
    };
    techStacks = ctx.techStacks;
  }

  const techStackName = new URLSearchParams(this.resourceQuery).get(
    'techStack',
  );
  const techStack = techStacks.find((t) => t.name === techStackName)!;

  let code = techStack.transformCode(raw, {
    type: 'external',
    fileAbsPath: this.resourcePath,
  });
  code = `import '${winPath(this.resourcePath)}?watch=parent';${code}`;
  return code;
}
