import test from 'ava';
import BtPage from '../../src/class/bt-page';

test('btPage.use', (t) => {
    const counter = {
        pluginA: {},
        pluginB: {},
    };

    const pluginA = ({
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
            onShow(options) {
                counter.pluginA.onShow = options;
            },
        },
    });

    const pluginB = ({
        name: 'pluginB',
        data: {
            name: 'jerryc',
            hobby: ['game'],
            level: {
                name: 'jerryc',
                skill: [{ name: 'guitar' }, { name: 'painting' }],
            },
        },
        nativeHook: {
            onShow(options) {
                counter.pluginB.onShow = options;
            },
        },
    });

    const btPage = new BtPage({
        myData: 'myData',
    });

    t.is(btPage.myData, 'myData');

    return Promise
        .resolve()

        // use pluginA only
        .then(() => {
            btPage.use(pluginA);
            t.deepEqual(btPage.data.pluginA, pluginA.data);

            const optSym1 = Symbol('optSym1:options');
            return btPage
                .onShow(optSym1)
                .then(() => t.deepEqual(counter.pluginA.onShow, optSym1));
        })

        // use both pluginA and pluginB
        .then(() => {
            btPage.use(pluginB);
            const optSym2 = Symbol('optSym2:options');

            t.deepEqual(btPage.data, {
                pluginA: pluginA.data,
                pluginB: pluginB.data,
            });

            return btPage
                .onShow(optSym2)
                .then(() => {
                    t.deepEqual(counter.pluginA.onShow, optSym2);
                    t.deepEqual(counter.pluginB.onShow, optSym2);
                });
        });
});

test('has protected key', (t) => {
    t.is(t.throws(() => new BtPage({
        use() {
            return 'use func of plugin';
        },
    })).message, 'you can\'t use protected domain: use at BtPage');

    t.is(t.throws(() => new BtPage({
        _btPlugin: 'hh',
        use() {
            return 'use func of plugin';
        },
    })).message, 'you can\'t use protected domain: _btPlugin at BtPage');
});
