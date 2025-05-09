import type { IMdTransformerResult } from '../..';
// @ts-ignore
import fs from 'fs';
import * as prettier from 'prettier';

export default (ret: IMdTransformerResult) => {
  const content = prettier.format(ret.content, {
    parser: 'babel',
    endOfLine: 'lf', // 强制使用 LF 作为行尾符(Windows 平台下也是 LF)
  });

  const filePath = `${__filename}.snap`;
  if (
    (!fs.existsSync(filePath) || process.env.UPDATE_SNAPSHOT) &&
    !process.env.CI
  ) {
    fs.writeFileSync(filePath, content);
    return;
  }

  const snap = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n'); // 统一换行符

  expect(content).toEqual(snap);
};
