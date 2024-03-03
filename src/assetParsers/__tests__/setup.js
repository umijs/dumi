import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'path';

const execPromise = promisify(exec);

export default async function () {
  const tsconfigPath = path.join(__dirname, 'tsconfig.test.json');
  const files = path.resolve(__dirname, './FakeParser.{js,d.ts}');
  await execPromise(`tsc --project ${tsconfigPath}`);
  await execPromise(`prettier ${files} --write`);
}
