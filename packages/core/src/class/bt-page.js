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
            Object.keys(content).forEach((key) => {
                if (NATIVE_HOOKS.includes(key)) {
                    // register native hook function
                    if (typeof content[key] === 'function') {
                        this.pushHookFun(key, content[key]);
                    }
                } else {
                    // protected domain check
                    if (this[key] !== undefined) {
                        throw new Error(`you can't use protected domain: ${key} at BtPage`);
                    }
                    this[key] = content[key];
                }
            });
        }
    }
}

export default BtPage;
