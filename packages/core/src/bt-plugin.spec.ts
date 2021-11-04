import BtPlugin, { IBtPlugin } from './bt-plugin';

type NativeHook = 'onShow' | 'onHide';

describe('BtPlugin', () => {
  it('1. 完整创建 plugin', async () => {
    const testContext = { test: 'test' };
    const pluginA: IBtPlugin<NativeHook, typeof testContext> = {
      name: 'pulginA',
      data: {},
      nativeHook: {
        onShow: async () => 'on host show, catched in plugin',
      },
      eventHandler: {
        onClick: async () => 'on pluginA click in eventHandler',
      },
      customMethod: {
        getName: async () => 'my name pluginA',
        getHobby: async () => ['guitar', 'sketaing'],
      },
      lifetimes: {
        beforeAttach: async (ctx) => ({ text: 'plugin beforeAttach called', ctx }),
        attached: async (ctx) => ({ text: 'plugin attached called', ctx }),
        initialize: async (ctx) => ({ text: 'plugin initialize called', ctx }),
      },

      // old name
      handler: {
        onClick: async () => 'on pluginA click in handler',
        onHover: async () => 'on pluginA hover in handler',
      },
    };

    const btPlugin = new BtPlugin(pluginA);
    expect(btPlugin.name).toEqual(pluginA.name);
    expect(btPlugin.content.data).toEqual(pluginA.data);
    expect(btPlugin.content.custom).toEqual(pluginA.customMethod);
    expect(btPlugin.content.nativeHook).toEqual(pluginA.nativeHook);

    // 新旧命名空间都要支持，且eventHandler 优先级更高
    expect(await btPlugin.content.handler?.onClick(testContext)).toEqual(await pluginA.eventHandler?.onClick(testContext));
    expect(await btPlugin.content.handler?.onHover(testContext)).toEqual(await pluginA.handler?.onHover(testContext));

    expect(await btPlugin.beforeAttach?.(testContext)).toEqual(await pluginA.lifetimes?.beforeAttach(testContext));
    expect(await btPlugin.attached?.(testContext)).toEqual(await pluginA.lifetimes?.attached(testContext));
    expect(await btPlugin.initialize?.(testContext)).toEqual(await pluginA.lifetimes?.initialize(testContext));
  });
});
