import yaml from 'js-yaml';
import { winEOL } from '@umijs/utils';

export default (source: string) => {
  const parsed = yaml.safeLoad(source);
  const data: Record<string, any> = typeof parsed === 'object' ? parsed : {};

  // specialize for uuid, to avoid parse as number, error cases: 001, 1e10
  if (data.uuid !== undefined) {
    data.uuid = winEOL(source).match(/(?:^|\n)\s*uuid:\s*([^\n]+)/)[1];
  }

  return data;
};
