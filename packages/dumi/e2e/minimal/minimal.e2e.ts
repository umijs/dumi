import fs from 'fs';
import path from 'path';
import { utils } from 'umi';
import { fork } from 'child_process';
import puppeteer from 'puppeteer';
import symlink from '../../../preset-dumi/src/utils/symlink';

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
    });

    child.on('message', async args => {
      if (args.type === 'DONE') {
        browser = await puppeteer.launch({
          args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--no-first-run',
            '--no-zygote',
            '--no-sandbox',
          ],
        });
        done();
      }
    });

    child.on('error', err => {
      throw err;
    });

    process.on('exit', () => {
      child.kill('SIGINT');
    });

    // workaround for resolve dumi-theme-default
    fs.mkdirSync(path.join(__dirname, 'node_modules'));
    symlink(
      path.join(__dirname, '../../../theme-default'),
      path.join(__dirname, 'node_modules', 'dumi-theme-default'),
    );
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  test('dev server', async () => {
    await page.goto('http://localhost:12341', { waitUntil: 'networkidle2' });

    expect(await page.evaluate(() => document.querySelector('h1').innerHTML)).toEqual('dumi');
  });

  test('build', done => {
    fork(SCRIPT_PATH, ['build'], {
      cwd: __dirname,
    }).on('exit', code => {
      expect(code).toEqual(0);
      done();
    });
  });

  afterAll(() => {
    browser.close();
    child.kill('SIGINT');
    utils.rimraf.sync(path.join(__dirname, 'dist'));
    utils.rimraf.sync(path.join(__dirname, '.umi'));
    utils.rimraf.sync(path.join(__dirname, 'node_modules'));
  });
});
