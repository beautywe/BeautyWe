import { MiddlewareQueue } from '@beautywe/middleware-queue';

export enum Lifecycle {
  // 保持第 0 位，为启动钩子
  onLaunch = 'onLaunch',
  onShow = 'onShow',
  onHide = 'onHide',

  // onError 不能监听，发生错误的时候，会发生死循环。
  // 'onError',
  onPageNotFound = 'onPageNotFound',
}

export class BtApp {
  private lifecycleHooks: Record<Lifecycle, MiddlewareQueue> = {
    [Lifecycle.onLaunch]: null,
    [Lifecycle.onShow]: null,
    [Lifecycle.onHide]: null,
    [Lifecycle.onPageNotFound]: null,
  };

  constructor() {
    // 初始化生命周期队列
    Object.keys(Lifecycle).forEach((lifecycle) => {
      this.lifecycleHooks[lifecycle] = new MiddlewareQueue(lifecycle);
    });
  }

  // public use(plugin) {

  // }
}

export default BtApp;
