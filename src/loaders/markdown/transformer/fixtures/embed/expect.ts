import { IMdTransformerResult } from '../..';

export default (ret: IMdTransformerResult) => {
  expect(ret.content).toEqual(
    '<><div className="markdown"><h3 id="this-is-indexmd"><a aria-hidden="true" tabIndex="-1" href="#this-is-indexmd"><span className="icon icon-link" /></a>{"This is index.md"}</h3><h3 id="this-is-embedmd"><a aria-hidden="true" tabIndex="-1" href="#this-is-embedmd"><span className="icon icon-link" /></a>{"This is embed.md"}</h3><p>{$$contentTexts[0].value}</p><p>{$$contentTexts[1].value}</p><p>{$$contentTexts[2].value}</p></div><Container type="success"><p>{$$contentTexts[3].value}</p></Container><div className="markdown"><h3 id="this-is-embedmd-1"><a aria-hidden="true" tabIndex="-1" href="#this-is-embedmd-1"><span className="icon icon-link" /></a>{"This is embed.md"}</h3><h3 id="this-is-embedmd-2"><a aria-hidden="true" tabIndex="-1" href="#this-is-embedmd-2"><span className="icon icon-link" /></a>{"This is embed.md"}</h3><p>{$$contentTexts[4].value}</p><h3 id="this-is-embedmd-3"><a aria-hidden="true" tabIndex="-1" href="#this-is-embedmd-3"><span className="icon icon-link" /></a>{"This is embed.md"}</h3><p>{$$contentTexts[5].value}</p><p>{$$contentTexts[6].value}</p><p>{$$contentTexts[7].value}</p></div><Container type="success"><p>{$$contentTexts[8].value}</p></Container><div className="markdown"><h3 id="this-is-embedmd-4"><a aria-hidden="true" tabIndex="-1" href="#this-is-embedmd-4"><span className="icon icon-link" /></a>{"This is embed.md"}</h3><p>{$$contentTexts[9].value}</p><p>{$$contentTexts[10].value}</p><p>{$$contentTexts[11].value}</p></div><Container type="success"><p>{$$contentTexts[12].value}</p></Container></>',
  );

  expect(ret.meta.texts?.[2].value).toEqual('type:null');
};
