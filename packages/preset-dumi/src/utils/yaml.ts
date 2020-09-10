import yaml from 'js-yaml';

export default (source: string) => {
  const data = (yaml.safeLoad(source) || {}) as { [key: string]: any };

  // specialize for uuid, to avoid parse as number, error cases: 001, 1e10
  if (data.uuid !== undefined) {
    data.uuid = source.match(/(?:^|\n)\s*uuid:\s*([^\n]+)/)[1];
  }

  return data;
};
