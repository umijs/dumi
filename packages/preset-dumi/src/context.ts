import { IApi } from '@umijs/types';
import { IDumiOpts } from '.';

const context: { umi?: IApi; opts?: IDumiOpts } = {};

export function init(umi: IApi, opts: IDumiOpts) {
  context.umi = umi;
  context.opts = opts;
}

export default context;
