import path from 'path';
import { IMdTransformerResult } from '../..';

export default (ret: IMdTransformerResult) => {
  const embedMdPath = path.join(__dirname, 'embed.md');
  expect(ret.content).toEqual(
    '<><div className="markdown"><h3 id="this-is-indexmd"><a aria-hidden="true" tabIndex="-1" href="#this-is-indexmd"><span className="icon icon-link" /></a>{"This is index.md"}</h3></div><React.Fragment children={require(\'' +
      embedMdPath +
      "?').default()} /><React.Fragment children={require('" +
      embedMdPath +
      "?range=L1').default()} /><React.Fragment children={require('" +
      embedMdPath +
      "?range=L1-L3').default()} /><React.Fragment children={require('" +
      embedMdPath +
      "?regexp=%2F%5E%28first%29%2B%2F').default()} /></>;\n",
  );
};
