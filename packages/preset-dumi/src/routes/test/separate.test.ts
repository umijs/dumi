import separateMetaFromRoutes from '../separateMetaFromRoutes';

describe('routes: separate', () => {
  it('separate meta from routes', () => {

    const routes = [{ path: '/a', meta: { title: 'a' }, routes: [{ path: '/a/v', meta: { title: 'v' } }] }, { path: '/b', meta: { title: 'b' } }, {}];
    const { routes: separateRoutes, metas: separateMetas } = separateMetaFromRoutes(routes);

    expect(separateRoutes).toEqual([{ path: '/a', routes: [{ path: '/a/v', }] }, { path: '/b' }, {}]);
    expect(separateMetas).toEqual({ "/a": { title: 'a' }, "/a/v": { title: 'v' }, "/b": { title: 'b' } });
  });
});
