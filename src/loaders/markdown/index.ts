import transform from './transformer';

export default function mdLoader(this: any, raw: string) {
  const cb = this.async();

  transform(raw).then((jsx) => {
    cb(null, `export default () => ${jsx}`);
  }, cb);
}
