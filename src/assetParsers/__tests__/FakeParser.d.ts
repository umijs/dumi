import {
  AtomAssetsParserResult,
  BaseAtomAssetsParser,
  LanguageMetaParser,
} from '../../../dist';
declare class FakeLangParser implements LanguageMetaParser {
  patch(): void;
  parse(): Promise<AtomAssetsParserResult>;
  destroy(): Promise<void>;
}
export declare class FakeParser extends BaseAtomAssetsParser<FakeLangParser> {
  constructor();
}
export {};
