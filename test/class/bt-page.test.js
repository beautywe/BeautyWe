import test from 'ava';
import BtPage from '../../src/class/bt-page';

// TODO
test('has protected key', () => {
    const pluginA = {
        name: 'pluginA',
    };

    const myPage = new BtPage({
        // _btPlugin: 'test',
        use() {
            return 'use func of plugin';
        },
    });

    myPage.use(pluginA);
    console.log({ plugins: myPage._btPlugin.plugins });
});
