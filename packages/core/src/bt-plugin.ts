/**
 * BtPlugin Domain Modal
 * 领域模型，定义 plugin 应该有哪些属性。
 */

import BtError from './error';

export interface Lifetimes {
  // TODO theHost 类型根据宿主决定，应当换成范式传入，枚举：APP、Page、Component
  beforeAttach: (theHost: any) => void;
  attached: (theHost: any) => void;
  initialize: (theHost: any) => void;
}

export interface IBtPlugin {
  name: string;
  data: object;
  lifetimes: Lifetimes;
  nativeHook?: Record<string, (theHost: any) => void>;
  handler?: Record<string, (theHost: any) => void>;
  eventHandler?: Record<string, (theHost: any) => void>;
  customMethod?: Record<string, (theHost: any) => void>;

  npmName?: string;
  version?: string;
  relyOn?: {
    npmName?: string;
    version?: string;
  }
}

export class BtPlugin {
  public name: IBtPlugin['name'];

  public npmName: IBtPlugin['npmName'];

  public version: IBtPlugin['version'];

  public options: {
    relyOn: IBtPlugin['relyOn'];
  };

  public plugin: {
    data: IBtPlugin['data'];
    custom: IBtPlugin['customMethod'];
    nativeHook: IBtPlugin['nativeHook'];
    handler: IBtPlugin['eventHandler'];
  };

  public beforeAttach: Lifetimes['beforeAttach'];

  public attached: Lifetimes['attached'];

  public initialize: Lifetimes['initialize'];

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
  constructor(plugin: IBtPlugin) {
    if (!plugin.name) throw new BtError('params of name are required when create a BtPlugin.');

    this.name = plugin.name;
    this.npmName = plugin.npmName;
    this.version = plugin.version;
    this.plugin = {
      data: plugin.data,
      custom: plugin.customMethod,
      nativeHook: plugin.nativeHook,
      handler: { ...plugin.handler, ...plugin.eventHandler },
    };
    this.options = {
      relyOn: plugin.relyOn,
    };
    if (typeof plugin.lifetimes.beforeAttach === 'function') {
      this.beforeAttach = plugin.lifetimes.beforeAttach.bind(this);
    }
    if (typeof plugin.lifetimes.attached === 'function') {
      this.attached = plugin.lifetimes.attached.bind(this);
    }
    if (typeof plugin.lifetimes.initialize === 'function') {
      this.initialize = plugin.lifetimes.initialize.bind(this);
    }
  }
}

export default BtPlugin;
