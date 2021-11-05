import { logger } from './logger';
import { compose } from './compose';
import { Middleware } from '../type/index';
import callNextWhileIgnore from './call-next-while-ignore';

export class MiddlewareQueue<Context> {
  private name = 'anonymous';

  private queue: Array<Middleware<Context>> = [];

  constructor(name: string) {
    if (name) this.name = name;
  }

  public push(middleware: Middleware<Context>) {
    logger.debug(
      `MiddlewareQueue:${this.name}`,
      'a middleware pushed',
      middleware,
    );

    this.queue.push(callNextWhileIgnore(middleware));
  }

  public async runAll(context: Context) {
    logger.debug(
      `MiddlewareQueue:${this.name}`,
      'will run all middleware as serial',
    );
    return compose(this.queue)(context);
  }
}

export default MiddlewareQueue;