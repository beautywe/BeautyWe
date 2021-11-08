import BtPage, { WxPageOptions, BtPagePlugin } from './bt-page';

describe('BtPage', () => {
  it('1. 完整创建 Page 对象', () => {
    const wxPageOptions: WxPageOptions = {
      data: { name: 'test btpage' },
      onShow: () => {
        console.log('on test page show');
      },
    };

    const btPage = new BtPage(wxPageOptions);

    expect(btPage.data.name).toEqual(wxPageOptions?.data?.name);
  });

  it('2. 使用插件', async () => {
    const wxPageOptions: WxPageOptions = {
      data: { name: 'test btpage' },
      onshow: () => {
        console.log('on test page show');
      },
    };

    const counter: any = {
      pluginA: {},
      pluginB: {},
    };

    const pluginA: BtPagePlugin = {
      name: 'pluginA',
      data: {
        name: 'david',
        hobby: ['sketing', 'painting', 'guitar'],
        level: {
          name: 'david',
          skill: [{ name: 'sketing' }, { name: 'painting' }],
        },
      },
      nativeHook: {
        onShow: async (options) => {
          counter.pluginA.onShow = options;
        },
      },
    };

    const btPage = new BtPage(wxPageOptions);

    // use pluginA only
    btPage.use(pluginA);

    // expect data merged
    expect(btPage.data?.pluginA).toEqual(pluginA.data);
  });
});
