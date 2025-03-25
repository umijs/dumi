import type { IMdTransformerResult } from '../..';
// @ts-ignore
import fs from 'fs';
import * as prettier from 'prettier';

export default (ret: IMdTransformerResult) => {
  const content = prettier.format(ret.content, { parser: 'babel' });

  const filePath = `${__filename}.snap`;
  if (!fs.existsSync(filePath) || process.env.UPDATE_SNAPSHOT) {
    fs.writeFileSync(filePath, content);
    return;
  }

  const snap = fs.readFileSync(filePath, 'utf-8');
  expect(content).toEqual(snap);
};
