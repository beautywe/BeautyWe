import { keys } from '../type';
import Host from './host';

type NativeHook = keyof WechatMiniprogram.Page.ILifetime;
const nativeHooks = keys<WechatMiniprogram.Page.ILifetime>();

class BtPage extends Host<NativeHook> {
  constructor(rawApp: WechatMiniprogram.Page.Options<WechatMiniprogram.Page.DataOption, WechatMiniprogram.Page.CustomOption>) {
    super({ rawHost: rawApp, nativeHook: nativeHooks, launchHook: 'onLoad' });
  }
}

export default BtPage;
