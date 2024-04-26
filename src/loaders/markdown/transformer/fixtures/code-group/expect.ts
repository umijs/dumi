import { IMdTransformerResult } from '../..';

export default (ret: IMdTransformerResult) => {
  expect(ret.content).toEqual(
    '<><div className="markdown"><h3 id="codegroup"><a aria-hidden="true" tabIndex="-1" href="#codegroup"><span className="icon icon-link" /></a>{"CodeGroup"}</h3></div><CodeGroup><SourceCode title="npm" lang="bash">{$$contentTexts[0].value}</SourceCode><SourceCode title="yarn" lang="bash">{$$contentTexts[1].value}</SourceCode><SourceCode title="pnpm" lang="bash">{$$contentTexts[2].value}</SourceCode></CodeGroup></>',
  );
};
