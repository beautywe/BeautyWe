import test from 'ava';
import BtPlugin from '../../src/class/bt-plugin';

/**
 * 对 BtPlugin 测试，只关心能创建出 btPlugin 实例。
 */

const pluginA = {
    name: 'pulginA',
    data: undefined,
    nativeHook: undefined,
    handler: {
        onPluginAClick: () => 'on pluginA click',
    },
    customMethod: {
        name: 'jerryc',
        hobby: ['guitar', 'sketaing'],
    },
    options: {
        somethingDisable: false,
    },
};

test('should create plugin complety', (t) => {
    const plugin = new BtPlugin(pluginA);
    t.deepEqual(plugin.content.data, pluginA.data);
    t.deepEqual(plugin.content.nativeHook, pluginA.nativeHook);
    t.deepEqual(plugin.content.handler, pluginA.handler);
    t.deepEqual(plugin.content.custom, pluginA.customMethod);
    t.is(plugin.options.somethingDisable, undefined);
    t.is(plugin.name, pluginA.name);
});

test('throws while name was null', (t) => {
    const error = t.throws(() => new BtPlugin(null), Error);
    t.is(error.message, 'Cannot read property \'name\' of null');
});

test('options should be optional', (t) => {
    t.notThrows(() => new BtPlugin(pluginA));
});
