import {
  transform,
  type TransformOptions,
} from '@umijs/bundler-utils/compiled/babel/core';
import plugin from '..';

export const transpile = (source: string, options?: TransformOptions) =>
  new Promise((resolve, reject) => {
    transform(
      source,
      {
        filename: '',
        presets: null,
        plugins: [plugin],
        configFile: false,
        ...options,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result?.code);
      },
    );
  });
