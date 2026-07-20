export const DEMO_OVERLAY_QUERY_PARAM = 'overlay';

export function getDemoResourceQuery() {
  const params = new URLSearchParams({ type: 'demo' });
  return `?${params.toString()}`;
}

export function getDemoOverlayResourceQuery() {
  const params = new URLSearchParams({
    type: 'demo',
    [DEMO_OVERLAY_QUERY_PARAM]: '1',
  });

  return `?${params.toString()}`;
}

export function isDemoOverlayQuery(resourceQuery = '') {
  const params = new URLSearchParams(resourceQuery);

  return (
    params.get('type') === 'demo' &&
    params.get(DEMO_OVERLAY_QUERY_PARAM) === '1'
  );
}
