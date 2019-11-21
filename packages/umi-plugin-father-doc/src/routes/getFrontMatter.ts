import fs from 'fs';
import yaml from 'js-yaml';

const FRONT_MATTER_EXP = /^\n*---\n([^]+?)\n---/;

/**
 * extract Front Matter config from markdown file
 */
export default (filePath: string): { [key: string]: any } => {
  const content = fs.readFileSync(filePath).toString();
  const raw = (content.match(FRONT_MATTER_EXP) || [])[1];
  const result = {};

  if (raw) {
    Object.assign(result, yaml.safeLoad(raw));
  }

  return result;
}
