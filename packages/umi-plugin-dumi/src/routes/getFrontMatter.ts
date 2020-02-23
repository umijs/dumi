import fs from 'fs';
import path from 'path';
import transformer from '../transformer';

/**
 * extract Front Matter config from markdown file
 */
export default (filePath: string): { [key: string]: any } => {
  const content = fs.readFileSync(filePath).toString();

  return transformer.markdown(content, path.parse(filePath).dir, true).config;
};
