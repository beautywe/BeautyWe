import Host from './host';

const NATIVE_HOOKS = [
    // 保持第 0 位，为启动钩子
    'onLaunch',
    'onShow',
    'onHide',

    // onError 不能监听，发生错误的时候，会发生死循环。
    // 'onError',
    'onPageNotFound',
];

class BtApp extends Host {
    constructor(content) {
        super({ nativeHookNames: NATIVE_HOOKS, launchHookName: NATIVE_HOOKS[0] });
        if (content) {
            // register native hook function
            NATIVE_HOOKS.forEach((funName) => {
                if (typeof content[funName] === 'function') {
                    this.pushHookFun(funName, content[funName]);
                }
            });

            // merge content to this
            Object.keys(content).forEach((key) => {
                if (!NATIVE_HOOKS.includes(key)) {
                    if (Object.prototype.hasOwnProperty.call(this, key)) {
                        throw new Error(`you can't use protected domain: ${key} at BtApp`);
                    }
                    if (Object.prototype.hasOwnProperty.call(content, key)) {
                        this[key] = content[key];
                    }
                }
            });
        }
    }
}

export default BtApp;
