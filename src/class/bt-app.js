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
            Object.keys(content).forEach((key) => {
                if (NATIVE_HOOKS.includes(key)) {
                    // register native hook function
                    if (typeof content[key] === 'function') {
                        this.pushHookFun(key, content[key]);
                    }
                } else {
                    // protected domain check
                    if (this[key] !== undefined) {
                        throw new Error(`you can't use protected domain: ${key} at BtApp`);
                    }
                    this[key] = content[key];
                }
            });
        }
    }
}

export default BtApp;
