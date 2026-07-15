require('sucrase/register');

const fs = require('fs');
const { getOrCreateWithFileLock } = require('../sharedCache.ts');

const [, , lockPath, valuePath, countPath] = process.argv;

function getValue() {
  try {
    return JSON.parse(fs.readFileSync(valuePath, 'utf-8'));
  } catch {
    return undefined;
  }
}

getOrCreateWithFileLock({
  lockPath,
  getValue,
  async createValue() {
    fs.appendFileSync(countPath, `${process.pid}\n`);
    await new Promise((resolve) => {
      setTimeout(resolve, 150);
    });
    return { createdBy: process.pid };
  },
  setValue(value) {
    fs.writeFileSync(valuePath, JSON.stringify(value));
  },
}).then((value) => process.stdout.write(JSON.stringify(value)));
