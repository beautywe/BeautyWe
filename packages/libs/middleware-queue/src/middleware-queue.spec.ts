import { MiddlewareQueue } from './middleware-queue';
import { logger, Level } from './logger';

logger.level = Level.DEBUG;

const sleep = () => new Promise((res) => setTimeout(res, 500));

describe('MiddlewareQueue', () => {
  test('should work', async () => {
    const queue = new MiddlewareQueue('beforeRegister');
    const context = { count: 0 };

    queue.push(async (ctx, next) => {
      expect(ctx.count).toBe(0);
      await sleep();
      await next?.();
      expect(ctx.count).toBe(1);
      // eslint-disable-next-line no-param-reassign
      ctx.count += 1;
      return 'I am first middleware';
    });

    queue.push(async (ctx, next) => {
      expect(ctx.count).toBe(0);
      // eslint-disable-next-line no-param-reassign
      ctx.count += 1;
      await sleep();
      await next?.();
      return 'I am second middleware';
    });

    const result = await queue.runAll(context);

    // 返回值取 middleware 栈顶的返回值
    expect(result).toEqual('I am first middleware');

    expect(context.count).toBe(2);
  });

  test('should work if ignore next', async () => {
    const queue = new MiddlewareQueue('beforeRegister');
    const context = { count: 0 };

    queue.push(async (ctx) => {
      expect(ctx.count).toBe(0);
      await sleep();
      // eslint-disable-next-line no-param-reassign
      ctx.count += 1;
      return 'I am first middleware';
    });

    queue.push(async (ctx) => {
      expect(ctx.count).toBe(1);
      await sleep();
      // eslint-disable-next-line no-param-reassign
      ctx.count += 1;
      return 'I am second middleware';
    });

    const result = await queue.runAll(context);

    // 返回值取 middleware 栈顶的返回值
    expect(result).toEqual('I am first middleware');

    expect(context.count).toBe(2);
  });
});
