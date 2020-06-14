import fs from 'fs';
import path from 'path';
import html from '../html';

describe('html transformer', () => {
  it('basic', () => {
    const filePath = path.join(__dirname, '../fixtures/raw/html-basic.html');
    const result = html(fs.readFileSync(filePath).toString());

    expect(result).toEqual(
      fs.readFileSync(path.join(__dirname, '../fixtures/expect/html-basic.html')).toString(),
    );
  });
});
