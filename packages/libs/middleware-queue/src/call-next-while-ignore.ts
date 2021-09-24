import { Middleware } from '../type/index';

const callNextWhileIgnore = (middleware: Middleware) => {
  const fn: Middleware = async (context, next) => {
    let nextCalled = 0;
    const result = await middleware(context, () => {
      nextCalled = 1;
      return next?.();
    });

    if (nextCalled === 0) await next?.();
    return result;
  };

  return fn;
};

export default callNextWhileIgnore;
