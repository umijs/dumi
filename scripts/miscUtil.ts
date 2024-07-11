import { execa } from '@umijs/utils';
import path from 'path';

interface IPackage {
  name: string;
  version: string;
  private: boolean;
  path: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: any;
}

export const workspaces: IPackage[] = (function () {
  try {
    const { stdout } = execa.execaSync(
      'pnpm',
      ['recursive', 'list', '--json'],
      {
        cwd: path.join(__dirname, '..'),
      },
    );
    return JSON.parse(stdout);
  } catch (error) {
    return [];
  }
})();

export const getExamples = () => {
  const __examplesPath = path.join(__dirname, '../examples');
  return workspaces.filter((pkg) => {
    return (pkg?.path || '').startsWith(__examplesPath);
  });
};

export function getPublishPackages() {
  return workspaces.filter((pkg) => {
    return [
      !pkg.private, // ignore private packages
      !['create-dumi'].includes(pkg.name), // ignore by name
    ].every(Boolean);
  });
}
