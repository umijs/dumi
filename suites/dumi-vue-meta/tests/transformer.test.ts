import path from 'path';
import { afterAll, expect, test } from 'vitest';
import type { MetaCheckerOptions } from '../src/index';
import {
  createProject,
  dumiTransformer,
  vueTypesSchemaResolver,
} from '../src/index';
import { rootPath, tsconfigPath } from './utils';

const checkerOptions: MetaCheckerOptions = {
  propertyResovlers: [vueTypesSchemaResolver],
  gitRevision: 'main', // pin to the main branch
  externalSymbolLinkMappings: {
    typescript: {
      Promise:
        'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
    },
  },
};

const project = createProject({
  rootPath,
  tsconfigPath,
  checkerOptions,
});

test('dumi-assets-types transformer', () => {
  const entry = path.resolve(__dirname, 'fixtures/index.ts');
  const meta = project.service.getComponentLibraryMeta(entry, dumiTransformer);
  expect(meta).toMatchSnapshot();
});

afterAll(() => {
  project.close();
});
