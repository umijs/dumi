import { transform } from 'sucrase';
import type { IDemoCompileFn } from '../theme-api/types';

const compile: IDemoCompileFn = async (code) => {
  return transform(code, {
    transforms: ['typescript', 'jsx', 'imports'],
  }).code;
};

export default compile;
