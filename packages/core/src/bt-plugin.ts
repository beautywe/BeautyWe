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
  lifetimes: Lifetimes<MiddlewareContext>;
  nativeHook?: Record<NativeHook, Middleware<MiddlewareContext>>;
  handler?: { [key: string]: Middleware<MiddlewareContext> };
  eventHandler?: IBtPlugin<NativeHook, MiddlewareContext>['handler'];
  customMethod?: { [key: string]: Middleware<MiddlewareContext> };

  npmName?: string;
  version?: string;
  relyOn?: {
    npmName?: string;
    version?: string;
  }
}

export class BtPlugin<NativeHook extends string, MiddlewareContext> {
  public name: IBtPlugin<NativeHook, MiddlewareContext>['name'];

  public npmName: IBtPlugin<NativeHook, MiddlewareContext>['npmName'];

  public version: IBtPlugin<NativeHook, MiddlewareContext>['version'];

  public options: {
    relyOn: IBtPlugin<NativeHook, MiddlewareContext>['relyOn'];
  };

  public content: {
    data: IBtPlugin<NativeHook, MiddlewareContext>['data'];
    custom: IBtPlugin<NativeHook, MiddlewareContext>['customMethod'];
    nativeHook: IBtPlugin<NativeHook, MiddlewareContext>['nativeHook'];
    handler: IBtPlugin<NativeHook, MiddlewareContext>['eventHandler'];
  };

  public beforeAttach: Lifetimes<MiddlewareContext>['beforeAttach'];

  public attached: Lifetimes<MiddlewareContext>['attached'];

  public initialize: Lifetimes<MiddlewareContext>['initialize'];

  /**
    * Crate a BtPlugin instance
    * @param {String} plugin.name 插件名
    * @param {Function} [plugin.beforeAttach] 插件装载前的钩子方法，beforeAttach({ theHost })
    * @param {Function} [plugin.attached] 插件装载完成的钩子方法，attached({ theHost })
    * @param {Function} [plugin.initialize] 初始化方法，会在宿主启动的时候初始化，已同步的形式执行，initialize({ theHost })
    * @param {Object} [plugin.data] 可选，混入到宿主的 data 部分
    * @param {Object} [plugin.customMethod] 可选，混入到宿主的自定义方法
    * @param {Object} [plugin.nativeHook] 可选，混入到宿主的原生钩子方法
    * @param {Object} [plugin.handler] 可选，混入到宿主的事件监听函数
    * @param {String} [plugin.npmName] 可选，插件在 npm 的名字，用来处理插件之间的冲突与依赖问题。
    * @param {String} [plugin.version] 可选，插件在 npm 的版本号，用来处理插件之间的冲突与依赖问题。
    * @param {Collection|Object|String} [plugin.relyOn] 用来检查依赖插件，支持 string, object{name, version, npmName}。
    * @param {string} [plugin.relyOn.npmName] npm 包的名字，可选
    * @param {string} [plugin.relyOn.version] npm 包的版本号，可选
    */
  constructor(plugin: IBtPlugin<NativeHook, MiddlewareContext>) {
    this.name = plugin.name;
    this.npmName = plugin.npmName;
    this.version = plugin.version;
    this.content = {
      data: plugin.data,
      custom: plugin.customMethod,
      nativeHook: plugin.nativeHook,
      handler: { ...plugin.handler, ...plugin.eventHandler },
    };
    this.options = {
      relyOn: plugin.relyOn,
    };
    this.beforeAttach = plugin.lifetimes.beforeAttach?.bind(this);
    this.attached = plugin.lifetimes.attached?.bind(this);
    this.initialize = plugin.lifetimes.initialize?.bind(this);
  }
}

export default BtPlugin;
