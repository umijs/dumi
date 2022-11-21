import type { IMdTransformerResult } from '../..';

export default (ret: IMdTransformerResult) => {
  expect(ret.content).toEqual(
    '<><div className="markdown"><img src={require(\'../logo.png\')} /></div></>',
  );
};
