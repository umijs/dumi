// Copy from React official demo.
// This will be replace if React release new version of use hooks
type ReactPromise<T> = Promise<T> & {
  status: 'pending' | 'fulfilled' | 'rejected';
  value?: T;
  reason?: any;
};

export default function use(promise: ReactPromise<any>) {
  if (promise.status === 'fulfilled') {
    return promise.value;
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
