import Host from './host';

const NATIVE_HOOKS = [
    // 保持第 0 位，为启动钩子
    'onLoad',
    'onShow',
    'onReady',
    'onHide',
    'onUnload',
    'onPullDownRefresh',
    'onReachBottom',
    'onPageScroll',
    'onResize',
    'onTabItemTap',

    // 因为 onShareAppMessage 需要同步返回一个 object，所以暂时不实现
    // 'onShareAppMessage',
];

class BtPage extends Host {
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
                        throw new Error(`you can't use protected domain: ${key} at BtPage`);
                    }
                    if (Object.prototype.hasOwnProperty.call(content, key)) {
                        this[key] = content[key];
                    }
                }
            });
        }
    }
}

export default BtPage;
