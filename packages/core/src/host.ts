/**
 * Host 宿主
 * 1. 对宿主进行可插件初始化
 * 2. 提供 use(plugin) 方法，实现插件的引入
 */

import type { Middleware } from '@beautywe/middleware-queue';
import { MiddlewareQueue } from '@beautywe/middleware-queue';
import logger from './logger';
import { BtPlugin, IBtPlugin } from './bt-plugin';
import BtError from './error';

export interface HostContext { }
export class Host<NativeHook extends string> {
  public data: Record<string, any> = {};

  public readonly plugin: {
    nativeHookNames: string[],

    // 存放 attached plugin info
    attachedPluginInfo: {
      name: BtPlugin<NativeHook, HostContext>['name'],
      content: BtPlugin<NativeHook, HostContext>['content'],
    }[],

    // 存放插件化的函数队列（native hook & handler hook）
    // （这个队列里面的方法，会在对应的钩子函数触发的时候被执行，参数：this => theHost，以及原有参数透传）
    pluggableFunQueueMap: Record<string, MiddlewareQueue<HostContext>>,

    // 存放每个插件的 initialize 方法，
    // （这个队列里面的方法，会在 onLoad,onLaunch 的时候会以同步的形式执行，参数：{ theHost } ）
    initializeQueue: MiddlewareQueue<HostContext>,
  };

  /**
   * New a host
   * @param {Object} options.rawHost 原生 App/Page obj
   * @param {Array} options.nativeHook
   * @param {String} options.launchHook
   */
  constructor({ rawHost, nativeHook, launchHook }: { rawHost: Record<string, any>, nativeHook: string[], launchHook: string }) {
    // new a domain space
    this.plugin = {
      nativeHookNames: nativeHook,
      attachedPluginInfo: [],
      pluggableFunQueueMap: {},
      initializeQueue: new MiddlewareQueue<HostContext>('initialize'),
    };

    // 对原生 Hooks 进行插件化
    nativeHook.forEach((hookName) => {
      const middlewareQueue = new MiddlewareQueue<HostContext>(hookName);
      this.plugin.pluggableFunQueueMap[hookName] = middlewareQueue;

      if (hookName === launchHook) {
        // 如果当前是启动 Hook，就队列前执行初始化钩子
        middlewareQueue.push(async (context) => {
          this.plugin.initializeQueue.runAll(context);
        });
      }

      // 代理 NativeHook，运行插件队列
      Object.defineProperty(this, hookName, {
        value: async (context: HostContext) => middlewareQueue.runAll(context),
      });
    });

    if (rawHost) {
      Object.keys(rawHost).forEach((key) => {
        // Data 域进行合并
        if (key === 'data') {
          Object.assign(this.data, rawHost.data);
          return;
        }

        // 对 RawHost 的 NativeHook 进行入队处理
        if (nativeHook.includes(key) && typeof rawHost[key] === 'function') {
          const originNativeHook = rawHost[key].bind(this);
          this.plugin.pluggableFunQueueMap[key]?.push(originNativeHook);
          return;
        }

        // 检查是否已被占用的 property
        if (Object.prototype.hasOwnProperty.call(this, key)) {
          throw new BtError(`很抱歉，${key} 是 BeautyWe 内部保护属性，请重新命名`);
        }

        // 默认情况，rawHost property 都定义在当前 host 实例上
        Object.defineProperty(this, key, { value: rawHost[key] });
      });
    }
  }

  /**
     * Use Plugin 使用插件
     * @param {object} plugins instance array of class BtPlugin<NativeHook, HostContext>
     * @param {object} plugins[n].name name of plugin
     * @param {object} plugins[n].content content of plugin
     * @param {object} plugins[n].content.data data for the host
     * @param {object} plugins[n].content.handler handler method for the host
     * @param {object} plugins[n].content.nativeHook nativeHook method for the host
     * @param {object} plugins[n].content.customMethod customMethod method for the host
     * @param {object} plugins[n].beforeAttach 插件装载前的钩子方法，beforeAttach({ theHost })
     * @param {object} plugins[n].attached 插件装载完成的钩子方法，attached({ theHost })
     * @param {object} plugins[n].initialize 初始化方法，会在宿主启动的时候初始化，已同步的形式执行，initialize({ theHost })
     */
  public use(plugins: BtPlugin<NativeHook, HostContext>[] | BtPlugin<NativeHook, HostContext> | IBtPlugin<NativeHook, HostContext> | IBtPlugin<NativeHook, HostContext>[]) {
    const theHost = this;
    const context = { theHost };
    let plgs: (BtPlugin<NativeHook, HostContext> | IBtPlugin<NativeHook, HostContext>)[];

    // 兼容数组与对象的使用方式：use(plugin), use([pluginA, pluginB]);
    if (!Array.isArray(plugins)) plgs = [plugins];
    else plgs = plugins;

    // 兼容传入对象的使用方式: use(plugin: BtPlugin<NativeHook, HostContext>), use(plugin: IBtPlugin<NativeHook, HostContext>)
    const btPlgs: BtPlugin<NativeHook, HostContext>[] = plgs.map(plg => {
      if (!(plg instanceof BtPlugin)) return new BtPlugin<NativeHook, HostContext>(plg);
      return plg;
    });

    btPlgs.forEach((plugin) => {
      // duplicative registerd checking
      if (this.plugin.attachedPluginInfo.map(item => item.name).includes(plugin.name)) {
        throw new BtError(`${plugin.name} 已经注册了，不允许重复注册`);
      }

      // do plugin beforeAttach hook functions
      if (typeof plugin.beforeAttach === 'function') plugin.beforeAttach(context);

      // attach plugin
      this.attachPlugin(plugin);

      // do plugin attached hook functions
      if (typeof plugin.attached === 'function') plugin.attached(context);

      // record plugin info
      this.plugin.attachedPluginInfo.push({
        name: plugin.name,
        content: plugin.content,
      });
    });
  }

  // 注入插件
  private attachPlugin(plugin: BtPlugin<NativeHook, HostContext>) {
    // 命名空间冲突检查
    if (this.data[plugin.name]) throw new BtError(`theHost.data.${plugin.name} 命名空间被占用了，插件 ${plugin.name} 需要用到该命名空间，你可以更改插件名（plugin.name = xxx）或者手动更改宿主 data 部分来处理冲突`);
    if (Object.prototype.hasOwnProperty.call(this, plugin.name)) throw new BtError(`theHost.${plugin.name} 命名空间被占用了，插件 ${plugin.name} 需要用到该命名空间，你可以更改插件名（plugin.name = xxx）或者手动处理冲突`);

    // attach data
    if (plugin.content.data) {
      this.data[plugin.name] = plugin.content.data;
    }

    // attach custom method
    if (plugin.content.custom) {
      this.plugin.initializeQueue.push(async () => {
        Object.assign(this, this.deepBind({
          funs: plugin.content.custom,
          domain: plugin.name,
        }));
      });
    }

    // attach native hook
    if (plugin.content.nativeHook) {
      Object.entries<Middleware<HostContext>>((plugin.content.nativeHook as never)).forEach(([hookName, hook]) => {
        if (typeof hook !== 'function') {
          logger.warn(`nativeHook attach fail，the native hook(${hookName}) should be a function`);
          return;
        }

        if (!this.plugin.pluggableFunQueueMap[hookName]) {
          logger.warn(`nativeHook attach fail，the native hook(${hookName}) not be support on the host`);
          return;
        }

        this.plugin.pluggableFunQueueMap[hookName].push(hook);
      });
    }

    // attach handler hook
    if (plugin.content.handler) {
      Object.entries<Middleware<HostContext>>((plugin.content.handler)).forEach(([handlerName, hook]) => {
        if (this.plugin.nativeHookNames.includes(handlerName)) {
          logger.warn(`nativeHook ${handlerName} not be allow definded on handler.`);
          return;
        }

        let handlerQueue = this.plugin.pluggableFunQueueMap[handlerName];

        // 动态创建 MiddlewareQueue
        if (!handlerQueue) {
          handlerQueue = new MiddlewareQueue<HostContext>(handlerName);
        }

        // 若宿主拥有同名 Handler，先入队
        // @ts-ignore
        const originHandler = this[handlerName];
        if (typeof originHandler === 'function') {
          handlerQueue.push(async (context) => originHandler.call(this, context));
        }

        // 插件 handler 入队
        handlerQueue.push(hook);
      });
    }

    // attach initialize function
    if (typeof plugin.initialize === 'function') {
      this.plugin.initializeQueue.push(plugin.initialize);
    }
  }

  /**
   * 绑定 theHost 到 funcs 下的所有方法的 this
   * @param {Host} theHost
   * @param {Object} funs
   */
  private deepBind({ funs, domain }: { funs: IBtPlugin<NativeHook, HostContext>['customMethod'], domain?: IBtPlugin<NativeHook, HostContext>['name'] }) {
    const theHost = this;
    const result: any = {};
    if (domain) result[domain] = {};

    if (funs) {
      Object.keys(funs).forEach((funName) => {
        const fun = funs[funName];
        if (fun === undefined) return;

        // 如果当前 value 是 object，递归。
        if (!Array.isArray(fun) && fun !== null && typeof fun === 'object') {
          if (domain) result[domain][funName] = this.deepBind({ funs: fun });
          else result[funName] = this.deepBind({ funs: fun });
        }

        // 如果当前 value 是 function，则 bind this with theHost
        if (typeof fun === 'function') {
          if (domain) result[domain][funName] = fun.bind(theHost);
          else result[funName] = fun.bind(theHost);
        }
      });
    }
    return result;
  }
}

export default Host;
