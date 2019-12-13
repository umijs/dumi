
export default async function ({ page, host }) {
  await page.goto(`${host}/`, {
    waitUntil: 'networkidle2',
  });
  const text = await page.evaluate(
    () => document.querySelector('h1').innerHTML,
  );
  expect(text).toEqual('father-doc');
};
