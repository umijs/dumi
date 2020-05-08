import fs from 'fs';
import path from 'path';
import transformer from '../transformer';

/**
 * extract Front Matter config from markdown file
 */
export default (fileAbsPath: string): { [key: string]: any } => {
  const { ext } = path.parse(fileAbsPath);
  const content = fs.readFileSync(fileAbsPath).toString();
  let result;

  switch (ext) {
    case '.tsx':
    case '.jsx':
    case '.ts':
    case '.js':
      result = transformer.jsx(content).config;
      break;

    case '.md':
      result = transformer.markdown(content, { fileAbsPath, onlyConfig: true }).config;
      break;

    default:
  }

  return result;
};
