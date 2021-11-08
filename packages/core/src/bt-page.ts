import { keys } from '../type';
import Host, { HostContext } from './host';
import { IBtPlugin } from './bt-plugin';

export type WxPageOptions = WechatMiniprogram.Page.Options<WechatMiniprogram.Page.DataOption, WechatMiniprogram.Page.CustomOption>;
export type NativeHook = keyof WechatMiniprogram.Page.ILifetime;
const nativeHooks = keys<WechatMiniprogram.Page.ILifetime>();

// TODO 换成固定 NativeHook 的 Context
export type BtPagePlugin = IBtPlugin<NativeHook, HostContext>;

class BtPage extends Host<NativeHook> {
  constructor(wxPageOptions: WechatMiniprogram.Page.Options<WechatMiniprogram.Page.DataOption, WechatMiniprogram.Page.CustomOption>) {
    super({ rawHost: wxPageOptions, nativeHook: nativeHooks, launchHook: 'onLoad' });
  }
}

export default BtPage;
