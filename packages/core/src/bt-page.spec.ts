import BtPage from './bt-page';

describe('BtPage', () => {
  it('1. 完整创建 Page 对象', () => {
    const rawPage = {
      data: { name: 'test btpage' },
    };

    const btPage = new BtPage(rawPage);

    expect(btPage.data.name).toEqual(rawPage.data.name);
  });
});
