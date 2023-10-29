import {
  AtomAssetsParserResult,
  BaseAtomAssetsParser,
  LanguageMetaParser,
  createRemoteClass,
} from '../../../dist';

class FakeLangParser implements LanguageMetaParser {
  patch() {}
  parse() {
    return new Promise<AtomAssetsParserResult>((resolve) => {
      setTimeout(() => {
        resolve({
          components: {},
          functions: {},
        });
      }, 1000);
    });
  }
  async destroy() {}
}

const fileName = __filename;
const dirName = __dirname;

const RemoteFakeParser = createRemoteClass(fileName, FakeLangParser);

export class FakeParser extends BaseAtomAssetsParser<FakeLangParser> {
  constructor() {
    super({
      entryFile: fileName,
      resolveDir: dirName,
      parser: new RemoteFakeParser(),
    });
  }
}
