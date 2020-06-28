import fs from 'fs';
import path from 'path';
import transformer from '../transformer';

/**
 * extract Front Matter config from markdown file
 */
export default (fileAbsPath: string): { [key: string]: any } => {
  const { ext } = path.parse(fileAbsPath);
  const content = fs.readFileSync(fileAbsPath).toString();
  let meta;

  switch (ext) {
    case '.tsx':
    case '.jsx':
    case '.ts':
    case '.js':
      ({ meta } = transformer.code(content));
      break;

    case '.md':
      ({ meta } = transformer.markdown(content, fileAbsPath));
      break;

    default:
  }

  // remove useless demo frontmatters
  const { demos, ...result } = meta;

  return result;
};
