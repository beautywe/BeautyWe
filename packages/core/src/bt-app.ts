import { keys } from '../type';
import Host from './host';

type NativeHook = keyof WechatMiniprogram.App.Option;
const nativeHooks = keys<WechatMiniprogram.App.Option>();

class BtApp extends Host<NativeHook> {
  constructor(rawApp: WechatMiniprogram.App.Options<Record<string, any>>) {
    super({ rawHost: rawApp, nativeHook: nativeHooks, launchHook: 'onLaunch' });
  }
}

export default BtApp;
