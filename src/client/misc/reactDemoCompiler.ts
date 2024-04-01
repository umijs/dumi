import { transform, type Transform } from 'sucrase';
import type { IDemoCompileFn } from '../theme-api/types';

const compile: IDemoCompileFn = async (code, { modules }) => {
  const transforms: Transform[] = ['typescript', 'jsx'];
  if (modules === 'cjs') {
    transforms.push('imports');
  }
  return transform(code, { transforms }).code;
};

export default compile;
