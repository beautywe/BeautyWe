/**
 * Host 宿主
 * 1. 对宿主进行可插件初始化
 * 2. 提供 use(plugin) 方法，实现插件的引入
 */

import logger from '../lib/logger';
import BtPlugin from './bt-plugin';
import BtError from '../lib/error';

/**
 * 计算需要依赖的但并没有引入的 plugins
 * @param {Host} options.theHost
 * @param {Array} options.relyOn
 */
function getNotIncludedPlugins({ theHost, relyOn }) {
    const thePluginsWasNotIncluded = [];

    function wasIncluded(relyConf, plugin) {
        const nameEqual = (plugin.name === relyConf.name);
        const npmNameEqual = (relyConf.npmName ? relyConf.npmName === plugin.npmName : true);
        const versionEqual = (relyConf.version ? relyConf.version === plugin.version : true);
        return nameEqual && npmNameEqual && versionEqual;
    }

    if (theHost._btPlugin.plugins) {
        relyOn.forEach((rely) => {
            let relyConf = rely;
            if (typeof rely === 'string') relyConf = { name: rely };
            thePluginsWasNotIncluded.push(relyConf);
            theHost._btPlugin.plugins.forEach((plugin) => {
                if (wasIncluded(relyConf, plugin)) {
                    thePluginsWasNotIncluded.pop();
                }
            });
        });
    }

    return thePluginsWasNotIncluded;
}

/**
 * 按循序执行 Promise 任务
 * @param {Array} options.tasks 要执行的任务队列
 * @param {Host} options.thisIns 宿主实例
 * @param {*} options.arg 透传的参数
 */
function sequenceTasks({ tasks, thisIns, arg }) {
    function recordValue(results, value) {
        results.push(value);
        return results;
    }
    const pushValue = recordValue.bind(null, []);
    return tasks.reduce(
        (promise, task) => promise
            .then(() => task.apply(thisIns, arg))
            .then(pushValue),
        Promise.resolve(),
    );
}

/**
 * 绑定 theHost 到 funcs 下的所有方法的 this
 * @param {Host} theHost
 * @param {Object} funs
 */
function deepBind({ theHost, funs, domain }) {
    const result = {};
    if (domain) result[domain] = {};

    Object.keys(funs).forEach((funName) => {
        const fun = funs[funName];
        if (fun === undefined) return;

        // 如果当前 value 是 object，递归。
        if (!Array.isArray(fun) && fun !== null && typeof fun === 'object') {
            if (domain) result[domain][funName] = deepBind({ theHost, funs: fun });
            else result[funName] = deepBind({ theHost, funs: fun });
        }

        // 如果当前 value 是 function，则 bind this with theHost
        if (typeof fun === 'function') {
            if (domain) result[domain][funName] = fun.bind(theHost);
            else result[funName] = fun.bind(theHost);
        }
    });

    return result;
}

/**
 * 钩子函数可插件化
 * 1. 对 native Hook 可插件化
 * 2. 对 handler Hook 可插件化
 * @param {String} theHost
 * @param {String} funName
 */
function hookFunPluggablify({ theHost, funName, beforeCall }) {
    // initializeize function queue (overwrite pluggabled function)
    theHost.newHookFunQueue(funName);

    // 避免重复改造，造成无限递归
    if (theHost[funName] && theHost[funName].isPluggableHookFun) {
        logger.warn(`hook function(${funName}) has been pluggabled, do not allow repetition.`);
        return;
    }

    // 标记 isPluggableHookFun，避免重复改造，造成无限递归。
    theHost[funName] = Object.defineProperty(
        function pluggableHookFun(...arg) {
            const _theHost = this;

            if (typeof beforeCall === 'function') beforeCall({ theHost: _theHost });

            const funQueue = _theHost.getHookFunQueue(funName);

            // 如果不存在，则 resolve
            if (!funQueue || !Array.isArray(funQueue)) return Promise.resolve();

            // 以 「先进先出」 的形式按顺序执行 Promise 链，未捕捉的错误，扔到 onError 去。
            return sequenceTasks({
                tasks: funQueue,
                thisIns: _theHost,
                arg,
            }).catch((err) => {
                if (typeof _theHost.onError === 'function') {
                    _theHost.onError(err);
                }
                throw err;
            });
        },
        'isPluggableHookFun', { value: true },
    );
}

/**
 * 插入一个 plugin
 * @param {Host} theHost
 * @param {BtPlugin} plugin
 */
function attachPlugin({ theHost, plugin }) {
    // check domain conflict
    if (!theHost.data) theHost.data = {};
    if (theHost.data[plugin.name]) throw new BtError(`theHost.data.${plugin.name} 命名空间被占用了，插件 ${plugin.name} 需要用到该命名空间，你可以更改插件名（plugin.name = xxx）或者手动更改宿主 data 部分来处理冲突`);
    if (theHost[plugin.name]) throw new BtError(`theHost.${plugin.name} 命名空间被占用了，插件 ${plugin.name} 需要用到该命名空间，你可以更改插件名（plugin.name = xxx）或者手动处理冲突`);

    // attach data
    if (plugin.content.data) {
        theHost.data[plugin.name] = plugin.content.data;
    }

    // attach custom method
    if (plugin.content.custom) {
        theHost.pushInitFun(({ theHost: _theHost }) => {
            Object.assign(_theHost, deepBind({
                theHost: _theHost,
                funs: plugin.content.custom,
                domain: plugin.name,
            }));
        });
    }

    // attach native hook
    if (plugin.content.nativeHook) {
        const nativeHooks = plugin.content.nativeHook;
        Object.keys(nativeHooks).forEach((funName) => {
            if (typeof nativeHooks[funName] !== 'function') {
                logger.warn(`nativeHook attach fail，the native hook(${funName}) should be a function`);
                return;
            }

            if (!theHost.getHookFunQueue(funName)) {
                logger.warn(`nativeHook attach fail，the native hook(${funName}) not be support on the host`);
                return;
            }
            theHost.pushHookFun(funName, nativeHooks[funName]);
        });
    }

    // attach handler hook
    if (plugin.content.handler) {
        const handlerHooks = plugin.content.handler;
        Object.keys(handlerHooks).forEach((funName) => {
            if (theHost._btPlugin.nativeHookNames.includes(funName)) {
                logger.warn(`nativeHook ${funName} not be allow definded on handler.`);
                return;
            }

            if (!theHost.getHookFunQueue(funName)) {
                let originFun;
                if (typeof theHost[funName] === 'function') originFun = theHost[funName];
                hookFunPluggablify({ theHost, funName });
                theHost.pushHookFun(funName, originFun);
            }
            theHost.pushHookFun(funName, handlerHooks[funName]);
        });
    }

    // attach initialize function
    if (typeof plugin.initialize === 'function') {
        theHost.pushInitFun(plugin.initialize.bind(plugin));
    }
}
class Host {
    /**
     * New a host
     * @param {Array} options.nativeHookNames
     * @param {String} options.launchHookName
     */
    constructor({ nativeHookNames = [], launchHookName }) {
        // new a domain space
        this._btPlugin = {
            nativeHookNames,

            // 存放 attached plugin info
            plugins: [],

            // 存放插件化的函数队列（native hook & handler hook）
            // （这个队列里面的方法，会在对应的钩子函数触发的时候被执行，参数：this => theHost，以及原有参数透传）
            pluggableFunQueueMap: {},

            // 存放每个插件的 initialize 方法，
            // （这个队列里面的方法，会在 onLoad,onLaunch 的时候会已同步的形式执行，参数：{ theHost } ）
            pluginsInitializeQueue: [],
        };

        nativeHookNames.forEach((funName) => {
            if (funName === launchHookName) {
                // custom method pluggable
                hookFunPluggablify({
                    theHost: this,
                    funName,
                    beforeCall({ theHost }) {
                        theHost.getInitFunQueue().forEach(task => task({ theHost }));
                    },
                });
            } else {
                // hook function pluggable
                hookFunPluggablify({ theHost: this, funName });
            }
        });
    }

    /**
     * Use Plugin 使用插件
     * @param {object} plugins instance array of class BtPlugin
     * @param {object} plugins[n].name name of plugin
     * @param {object} plugins[n].content content of plugin
     * @param {object} plugins[n].content.data data for the host
     * @param {object} plugins[n].content.handler handler method for the host
     * @param {object} plugins[n].content.nativeHook nativeHook method for the host
     * @param {object} plugins[n].content.customMethod customMethod method for the host
     * @param {object} plugins[n].options options of plugin
     * @param {Array} plugins[n].options.relyOn options of plugin
     * @param {object} plugins[n].beforeAttach 插件装载前的钩子方法，beforeAttach({ theHost })
     * @param {object} plugins[n].attached 插件装载完成的钩子方法，attached({ theHost })
     * @param {object} plugins[n].initialize 初始化方法，会在宿主启动的时候初始化，已同步的形式执行，initialize({ theHost })
     */
    use(plugins) {
        const theHost = this;
        let plgs = plugins;

        if (!plgs) throw new Error('params is required');

        // compatibel array and object
        if (plgs && !Array.isArray(plgs)) plgs = [plugins];

        for (let index = 0; index < plgs.length; index += 1) {
            // new a BtPlugin instance
            const plugin = new BtPlugin(plgs[index]);

            // self registerd checking
            if (theHost._btPlugin.plugins.map(item => item.name).includes(plugin.name)) {
                throw new BtError(`${plugin.name} 已经注册了，不允许重复注册`);
            }

            // rely on checking
            const { relyOn } = plugin.options;
            if (relyOn && Array.isArray(relyOn)) {
                const thePluginsWasNotIncluded = getNotIncludedPlugins({ theHost, relyOn });
                if (thePluginsWasNotIncluded.length > 0) {
                    thePluginsWasNotIncluded.forEach((need) => {
                        let message = `插件 ${plugin.name} 依赖插件 ${need.name}，请先注册 ${need.name}`;
                        if (need.npmName) {
                            const installMessage = need.version ? `${need.npmName}@${need.version}` : `${need.npmName}`;
                            message += `, 你可以通过以下命令安装它 'npm i ${installMessage}'`;
                        }
                        logger.error(message);
                    });
                    throw new BtError(`有 ${thePluginsWasNotIncluded.length} 个 ${plugin.name} 的依赖插件未预注册`);
                }
            }

            // record plugin info into this._btPlugin.plugins
            const pluginInfo = { name: plugin.name };
            if (plugin.npmName) pluginInfo.npmName = plugin.npmName;
            if (plugin.version) pluginInfo.version = plugin.version;
            theHost._btPlugin.plugins.push(pluginInfo);

            // do plugin beforeAttach hook functions
            if (typeof plugin.beforeAttach === 'function') plugin.beforeAttach({ theHost });

            // attach plugin
            attachPlugin({ theHost: this, plugin });

            // do plugin attached hook functions
            if (typeof plugin.attached === 'function') plugin.attached({ theHost });
        }
    }

    pushHookFun = (funName, func) => {
        this._btPlugin.pluggableFunQueueMap[funName].push(func);
    }

    newHookFunQueue = (funName) => {
        this._btPlugin.pluggableFunQueueMap[funName] = [];
    }

    getHookFunQueue = funName => this._btPlugin.pluggableFunQueueMap[funName]

    pushInitFun = (func) => {
        this._btPlugin.pluginsInitializeQueue.push(func);
    }

    getInitFunQueue = () => this._btPlugin.pluginsInitializeQueue
}

export default Host;
