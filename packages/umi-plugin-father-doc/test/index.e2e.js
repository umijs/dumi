const { join } = require('path');
const { fork } = require('child_process');
const http = require('http');
const puppeteer = require('puppeteer');
const { existsSync, readdirSync } = require('fs');

const fixtures = join(__dirname, 'fixtures');
let port = 12400;
let browser;
let page;
const servers = {};

let dirs = readdirSync(fixtures).filter(dir => dir.charAt(0) !== '.');
if (dirs.some(dir => dir.includes('-only'))) {
  dirs = dirs.filter(dir => dir.includes('-only'));
}

async function serve(base, key) {
  return new Promise(resolve => {
    port += 1;
    servers[key] = { port };
    servers[key].server = http.createServer((request, response) => {
      return require('serve-static')(base)(request, response);
    });
    servers[key].server.listen(port, () => {
      console.log(`[${key}] Running at http://localhost:${port}`);
      resolve();
    });
  });
}

async function build(base) {
  return new Promise((resolve, reject) => {
    const umiPath = join(process.cwd(), './packages/father-doc/bin/father-doc.js');
    const env = {
      COMPRESS: 'none',
      PROGRESS: 'none',
    };
    const child = fork(umiPath, ['build'], {
      cwd: base,
      env,
    });
    child.on('exit', code => {
      if (code === 1) {
        reject(new Error('Build failed'));
      } else {
        resolve();
      }
    });
  });
}

beforeAll(async () => {
  for (const dir of dirs) {
    const base = join(fixtures, dir);
    const targetDist = join(base, 'dist');
    if (!existsSync(targetDist)) {
      await build(base);
    }
    await serve(targetDist, dir);
  }
  browser = await puppeteer.launch({ args: ['--no-sandbox'] });
});

beforeEach(async () => {
  page = await browser.newPage();
});

for (const dir of dirs) {
  test(dir, async () => {
    await require(join(fixtures, `${dir}/test`)).default({
      page,
      host: `http://localhost:${servers[dir].port}`,
    });
  });
}

afterAll(() => {
  Object.keys(servers).forEach(key => {
    servers[key].server.close();
  });
  if (browser) browser.close();
});
