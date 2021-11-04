/**
 * BtPlugin Modal
 */

import type { Middleware } from '@beautywe/middleware-queue';

export interface Lifetimes<MiddlewareContext> {
  beforeAttach: Middleware<MiddlewareContext>;
  attached: Middleware<MiddlewareContext>;
  initialize: Middleware<MiddlewareContext>;
}

export interface IBtPlugin<NativeHook extends string, MiddlewareContext> {
  name: string;
  data: object;
  lifetimes?: Lifetimes<MiddlewareContext>;
  nativeHook?: { [key in NativeHook]?: Middleware<MiddlewareContext> };
  handler?: { [key: string]: Middleware<MiddlewareContext> };
  eventHandler?: IBtPlugin<NativeHook, MiddlewareContext>['handler'];
  customMethod?: { [key: string]: Middleware<MiddlewareContext> };
}

export class BtPlugin<NativeHook extends string, MiddlewareContext> {
  public name: IBtPlugin<NativeHook, MiddlewareContext>['name'];

  public content: {
    data: IBtPlugin<NativeHook, MiddlewareContext>['data'];
    custom: IBtPlugin<NativeHook, MiddlewareContext>['customMethod'];
    nativeHook: IBtPlugin<NativeHook, MiddlewareContext>['nativeHook'];
    handler: IBtPlugin<NativeHook, MiddlewareContext>['eventHandler'];
  };

  public beforeAttach: Lifetimes<MiddlewareContext>['beforeAttach'] | undefined;

  public attached: Lifetimes<MiddlewareContext>['attached'] | undefined;

  public initialize: Lifetimes<MiddlewareContext>['initialize'] | undefined;

  /**
    * Crate a BtPlugin instance
    * @param {String} plugin.name 插件名
    * @param {Function} [plugin.beforeAttach] 插件装载前的钩子方法，beforeAttach({ theHost })
    * @param {Function} [plugin.attached] 插件装载完成的钩子方法，attached({ theHost })
    * @param {Function} [plugin.initialize] 初始化方法，会在宿主启动的时候初始化，已同步的形式执行，initialize({ theHost })
    * @param {Object} [plugin.data] 可选，混入到宿主的 data 部分
    * @param {Object} [plugin.customMethod] 可选，混入到宿主的自定义方法
    * @param {Object} [plugin.nativeHook] 可选，混入到宿主的原生钩子方法
    * @param {Object} [plugin.eventHandler] 可选，混入到宿主的事件监听函数
    * @param {Object} [plugin.handler] 同 eventHandler
    */
  constructor(plugin: IBtPlugin<NativeHook, MiddlewareContext>) {
    this.name = plugin.name;
    this.content = {
      data: plugin.data,
      custom: plugin.customMethod,
      nativeHook: plugin.nativeHook,
      handler: { ...plugin.handler, ...plugin.eventHandler },
    };
    this.beforeAttach = plugin.lifetimes?.beforeAttach?.bind(this);
    this.attached = plugin.lifetimes?.attached?.bind(this);
    this.initialize = plugin.lifetimes?.initialize?.bind(this);
  }
}

export default BtPlugin;
