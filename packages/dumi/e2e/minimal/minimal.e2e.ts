import path from 'path';
import { fork } from 'child_process';
import puppeteer from 'puppeteer';

const SCRIPT_PATH = path.join(__dirname, '../../bin/dumi.js');

describe('minimal', () => {
  let child;
  let browser;
  let page;

  beforeAll(done => {
    child = fork(SCRIPT_PATH, ['dev'], {
      cwd: __dirname,
      env: {
        ...process.env,
        PORT: '12341',
        BROWSER: 'none',
      },
      silent: true,
    });

    child.stdout.on('data', async data => {
      // TODO: find the reason why cannot received message via on('message')
      if (data.indexOf('DONE') > -1) {
        browser = await puppeteer.launch();
        done();
      }
    });
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  test('dev server', async () => {
    await page.goto('http://localhost:12341');

    expect(await page.evaluate(() => document.querySelector('h1').innerHTML)).toEqual('dumi');
  });

  test('build', done => {
    fork(SCRIPT_PATH, ['build'], {
      cwd: __dirname,
      env: {
        ...process.env,
        PORT: '12341',
        BROWSER: 'none',
      },
      silent: true,
    }).on('exit', code => {
      expect(code).toEqual(0);
      done();
    });
  });

  afterAll(() => {
    browser.close();
    child.kill('SIGINT');
  });
});
