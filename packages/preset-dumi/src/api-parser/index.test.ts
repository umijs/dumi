import fs from 'fs';
import path from 'path';
import { winEOL } from '@umijs/utils';
import parser from '.';

const rawPath = path.join(__dirname, 'fixtures', 'raw');
const expectPath = path.join(__dirname, 'fixtures', 'expect');

function assertResult(filename) {
  expect(winEOL(JSON.stringify(parser(path.join(rawPath, filename)), null, 2))).toEqual(
    winEOL(
      fs.readFileSync(path.join(expectPath, `${path.basename(filename, '.tsx')}.json`)).toString(),
    ),
  );
}

describe('api parser', () => {
  it('should parse normal class component', () => {
    assertResult('class.tsx');
  });

  it('should parse normal function component', () => {
    assertResult('fc.tsx');
  });

  it('should parse extended class component', () => {
    assertResult('extends.tsx');
  });

  it('should parse forward ref component', () => {
    assertResult('forwardRef.tsx');
  });

  it('should parse union types', () => {
    assertResult('union.tsx');
  });

  it('should parse multiple exports', () => {
    assertResult('multiple.tsx');
  });

  it('should parse locale description', () => {
    assertResult('localeDescription.tsx');
  });
});
