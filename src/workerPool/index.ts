import path from 'path';
import workerpool from 'workerpool';

let pool: workerpool.Pool | undefined = undefined;

function createPool() {
  if (!pool) {
    pool = workerpool.pool(path.resolve(__dirname + '/worker.js'));
  }
}

export function terminatePool() {
  pool?.terminate();
  pool = undefined;
}

export async function compile(
  filePath: string,
  loaderBaseOpts: any,
): Promise<{ content: string; type: string }> {
  createPool();
  const result = await pool!.exec('render', [filePath, loaderBaseOpts]);
  return result;
}
