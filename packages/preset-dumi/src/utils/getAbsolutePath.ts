import path from 'path';
import slash from 'slash2';

export default function getAbsolutePath(componentPath: string) {
  return slash(path.join(process.cwd(), componentPath));
}
