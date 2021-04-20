import fs from 'fs';
import path from 'path';
import { listenFileOnceChange } from './watcher';

function triggerFileChange(filePath: string) {
  fs.writeFileSync(filePath, fs.readFileSync(filePath, 'utf8'));
}

describe('util: watcher', () => {
  const filePath = path.join(__dirname, './fixtures/watcher/file.js');

  beforeAll(() => {
    process.env.TEST_WATCHER = 'true';
  });

  it('basic watch', done => {
    listenFileOnceChange(filePath, () => {
      done();
    });

    setTimeout(() => {
      triggerFileChange(filePath);
    }, 10);
  });

  it('watch one file multi-times', done => {
    let count = 0;

    listenFileOnceChange(filePath, () => {
      count += 1;
    });

    listenFileOnceChange(filePath, () => {
      expect(count).toEqual(1);
      done();
    });

    setTimeout(() => {
      triggerFileChange(filePath);
    }, 10);
  });

  it('should not double register same listener', done => {
    let count = 0;

    const fn = () => {
      count += 1;
    }

    fn._identifier = 'fn';

    listenFileOnceChange(filePath, fn);
    listenFileOnceChange(filePath, fn);
    listenFileOnceChange(filePath, fn);
    listenFileOnceChange(filePath, () => {
      setTimeout(() => {
        expect(count).toEqual(1);
        done();
      });
    });

    setTimeout(() => {
      triggerFileChange(filePath);
    }, 10);
  });

  it('should not to watch in non-dev env', done => {
    let count = 0;
    delete process.env.TEST_WATCHER;

    listenFileOnceChange(filePath, () => {
      count += 1;
    });

    setTimeout(() => {
      triggerFileChange(filePath);

      setTimeout(() => {
        expect(count).toEqual(0);
        done();
      });
    }, 10);
  });
});
