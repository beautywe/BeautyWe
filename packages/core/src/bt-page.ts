import { keys } from '../type';
import Host from './host';

export type WxPageOptions = WechatMiniprogram.Page.Options<WechatMiniprogram.Page.DataOption, WechatMiniprogram.Page.CustomOption>;
export type NativeHook = keyof WechatMiniprogram.Page.ILifetime;
const nativeHooks = keys<WechatMiniprogram.Page.ILifetime>();

class BtPage extends Host<NativeHook> {
  constructor(wxPageOptions: WechatMiniprogram.Page.Options<WechatMiniprogram.Page.DataOption, WechatMiniprogram.Page.CustomOption>) {
    super({ rawHost: wxPageOptions, nativeHook: nativeHooks, launchHook: 'onLoad' });
  }
}

export default BtPage;
