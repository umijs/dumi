
export default async function ({ page, host }) {
  await page.goto(`${host}/`, {
    waitUntil: 'networkidle2',
  });
  await page.waitForSelector('h1');
  const text = await page.evaluate(
    () => document.querySelector('h1').innerHTML,
  );
  expect(text).toEqual('father-doc');
}
