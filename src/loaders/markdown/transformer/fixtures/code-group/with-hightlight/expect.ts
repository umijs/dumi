import { IMdTransformerResult } from '../..';

export default (ret: IMdTransformerResult) => {
  expect(ret.content).toEqual(
    '<><div className="markdown"><h3 id="codegroup"><a aria-hidden="true" tabIndex="-1" href="#codegroup"><span className="icon icon-link" /></a>{"CodeGroup"}</h3><blockquote><p>{$$contentTexts[0].value}</p></blockquote></div><CodeGroup><SourceCode title=".dumirc.ts" lang="ts" highlightLines={[1, 3, 4, 5]}>{$$contentTexts[1].value}</SourceCode></CodeGroup></>',
  );
};
