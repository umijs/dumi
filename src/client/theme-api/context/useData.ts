// Copy from React official demo.
// This will be replace if React release new version of use hooks
type ReactPromise<T> = Promise<T> & {
  status?: 'pending' | 'fulfilled' | 'rejected';
  value?: T;
  reason?: any;
};

function internalUse<T>(promise: ReactPromise<T>): T {
  if (promise.status === 'fulfilled') {
    return promise.value!;
  } else if (promise.status === 'rejected') {
    throw promise.reason;
  } else if (promise.status === 'pending') {
    throw promise;
  } else {
    promise.status = 'pending';
    promise.then(
      (result) => {
        promise.status = 'fulfilled';
        promise.value = result;
      },
      (reason) => {
        promise.status = 'rejected';
        promise.reason = reason;
      },
    );
    throw promise;
  }
}

const cache = new Map<string, Promise<any>>();

export default function useData<T>(key: string, getter: () => Promise<T>) {
  if (!cache.has(key)) {
    cache.set(key, getter());
  }

  return internalUse(cache.get(key)!);
}
