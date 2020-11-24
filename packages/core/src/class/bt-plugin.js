/**
 * BtPlugin Domain Modal
 * 领域模型，定义 plugin 应该有哪些属性。
 */

import BtError from '../lib/error';

class BtPlugin {
    /**
     * Crate a BtPlugin instance
     * @param {String} content.name 插件名
     * @param {Function} [content.beforeAttach] 插件装载前的钩子方法，beforeAttach({ theHost })
     * @param {Function} [content.attached] 插件装载完成的钩子方法，attached({ theHost })
     * @param {Function} [content.initialize] 初始化方法，会在宿主启动的时候初始化，已同步的形式执行，initialize({ theHost })
     * @param {Object} [content.data] 可选，混入到宿主的 data 部分
     * @param {Object} [content.customMethod] 可选，混入到宿主的自定义方法
     * @param {Object} [content.nativeHook] 可选，混入到宿主的原生钩子方法
     * @param {Object} [content.handler] 可选，混入到宿主的事件监听函数
     * @param {String} [content.npmName] 可选，插件在 npm 的名字，用来处理插件之间的冲突与依赖问题。
     * @param {String} [content.version] 可选，插件在 npm 的版本号，用来处理插件之间的冲突与依赖问题。
     * @param {Collection|Object|String} [content.relyOn] 用来检查依赖插件，支持 string, object{name, version, npmName}。
     * @param {string} [content.relyOn.npmName] npm 包的名字，可选
     * @param {string} [content.relyOn.version] npm 包的版本号，可选
     */
    constructor(content = {}) {
        if (!content.name) throw new BtError('params of name are required when create a BtPlugin.');

        this.name = content.name;
        this.npmName = content.npmName;
        this.version = content.version;
        this.content = {
            data: content.data,
            custom: content.customMethod,
            nativeHook: content.nativeHook,
            handler: content.handler,
        };
        this.options = {
            relyOn: content.relyOn,
        };
        if (typeof content.beforeAttach === 'function') {
            this.beforeAttach = content.beforeAttach.bind(this);
        }
        if (typeof content.attached === 'function') {
            this.attached = content.attached.bind(this);
        }
        if (typeof content.initialize === 'function') {
            this.initialize = content.initialize.bind(this);
        }
    }
}

export default BtPlugin;
