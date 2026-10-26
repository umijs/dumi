type RouteMetaHMRListener = () => void;

const revisions = new Map<string, number>();
const listeners = new Map<string, Set<RouteMetaHMRListener>>();

export function getRouteMetaHMRRevision(routeId: string) {
  return revisions.get(routeId) ?? 0;
}

export function subscribeRouteMetaHMR(
  routeId: string,
  listener: RouteMetaHMRListener,
) {
  const routeListeners = listeners.get(routeId) ?? new Set();

  routeListeners.add(listener);
  listeners.set(routeId, routeListeners);

  return () => {
    routeListeners.delete(listener);
    if (!routeListeners.size) listeners.delete(routeId);
  };
}

export function notifyRouteMetaHMR(routeId: string) {
  revisions.set(routeId, getRouteMetaHMRRevision(routeId) + 1);
  listeners.get(routeId)?.forEach((listener) => listener());
}
