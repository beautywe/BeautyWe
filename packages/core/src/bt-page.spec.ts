import BtPage, { WxPageOptions } from './bt-page';

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
});
