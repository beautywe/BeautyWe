import test from 'ava';
import _ from 'lodash';

export default function main({ BtApp, BtPage }) {
    test('[BtPlugin] options.relyOn', (t) => {
        const pluginA = ({
            name: 'pluginA',
            relyOn: ['pluginB'],
        });
        const pluginB = ({
            name: 'pluginB',
        });
        const app = new BtApp();

        const error = t.throws(() => {
            app.use(pluginA);
        }, Error);

        t.is(error.message, `[BeautyWe:error] 有 1 个 ${pluginA.name} 的依赖插件未预注册`);

        app.use(pluginB);
        app.use(pluginA);

        t.truthy(app._btPlugin.plugins[0].name, pluginB.name);
        t.truthy(app._btPlugin.plugins[1].name, pluginA.name);
    });

    test('[BtPlugin] options.relyOn: npmName & version', (t) => {
        const pluginA = ({
            name: 'pluginA',
            relyOn: [
                'pluginB',
                { name: 'pluginC', npmName: '@beautywe/plugin-pluginC', version: '0.0.2' },
            ],
        });
        const pluginB = ({ name: 'pluginB' });
        // eslint-disable-next-line
        const pluginC_version001 = ({ name: 'pluginC', npmName: '@beautywe/plugin-pluginC', version: '0.0.1' });
        // eslint-disable-next-line
        const pluginC_version002 = ({ name: 'pluginC', npmName: '@beautywe/plugin-pluginC', version: '0.0.2' });

        return Promise
            .resolve()
            .then(() => {
                const app = new BtApp();
                const error = t.throws(() => {
                    app.use(pluginA);
                }, Error);

                t.is(error.message, `[BeautyWe:error] 有 2 个 ${pluginA.name} 的依赖插件未预注册`);
            })
            .then(() => {
                const app = new BtApp();
                const error = t.throws(() => {
                    app.use(pluginB);
                    app.use(pluginA);
                }, Error);

                t.is(error.message, `[BeautyWe:error] 有 1 个 ${pluginA.name} 的依赖插件未预注册`);
            })
            .then(() => {
                const app = new BtApp();
                const error = t.throws(() => {
                    app.use(pluginB);
                    app.use(pluginC_version001);
                    app.use(pluginA);
                }, Error);

                t.is(error.message, `[BeautyWe:error] 有 1 个 ${pluginA.name} 的依赖插件未预注册`);
            })
            .then(() => {
                const app = new BtApp();
                t.notThrows(() => {
                    app.use(pluginB);
                    app.use(pluginC_version002);
                    app.use(pluginA);
                }, Error);
            });
    });

    test('[BtPlugin] custom merging', (t) => {
        const pluginContent = {
            name: 'pluginA',
            customMethod: {
                sayHello() {
                    return { msg: 'hello', context: this };
                },
                level2: {
                    sayHello() {
                        return { msg: 'hello', context: this };
                    },
                    level3: {
                        sayHello() {
                            return { msg: 'hello', context: this };
                        },
                    },
                },
            },
        };
        const pluginA = (pluginContent);
        const app = new BtApp();

        app.use(pluginA);

        return app.onLaunch().then(() => {
            t.truthy(app._btPlugin.plugins[0].name, pluginA.name);

            const { msg, context } = app.pluginA.sayHello();
            const { msg: msg2, context: context2 } = app.pluginA.level2.sayHello();
            const { msg: msg3, context: context3 } = app.pluginA.level2.level3.sayHello();
            t.is(msg, 'hello');
            t.is(msg2, 'hello');
            t.is(msg3, 'hello');
            t.is(context, app);
            t.is(context2, app);
            t.is(context3, app);
        });
    });

    test('[BtPlugin] custon merging : should be fine while origin function existed', (t) => {
        const pluginContent = {
            name: 'pluginA',
            customMethod: {
                sayHello() {
                    return { msg: 'hello', context: this };
                },
            },
        };
        const pluginA = (pluginContent);
        let isBtAppLaunch = false;
        let app;

        return Promise
            .resolve()

        // with App.onLaunch
            .then(() => {
                app = new BtApp({
                    onLaunch() {
                        isBtAppLaunch = true;
                    },
                });

                app.use(pluginA);
                return app.onLaunch();
            })

            .then(() => {
                t.is(isBtAppLaunch, true);
                t.truthy(app._btPlugin.plugins[0].name, pluginA.name);
                const { msg, context } = app.pluginA.sayHello();
                t.is(msg, 'hello');
                t.is(context, app);
            });
    });

    test('[BtPlugin] domain conflict of data and custom', (t) => {
        const pluginContent = {
            name: 'pluginA',
            data: {
                name: 'pluginA',
            },
            customMethod: {
                sayHello() {
                    return { msg: 'hello', context: this };
                },
            },
        };
        const pluginA = (pluginContent);

        return Promise
            .resolve()
            .then(() => {
                const appWithNoConflict = new BtApp({
                    data: { name: 'appWithNoConflict' },
                    sayHelloOfApp() {
                        return { msg: 'hello, i am app' };
                    },
                });
                t.notThrows(() => {
                    appWithNoConflict.use(pluginA);
                });
            })
            .then(() => {
                const appWithConflictOfData = new BtApp({
                    data: { pluginA: { name: 'appWithConflict' } },
                });
                const error = t.throws(() => {
                    appWithConflictOfData.use(pluginA);
                });
                t.is(error.message, `[BeautyWe:error] theHost.data.${pluginA.name} 命名空间被占用了，插件 ${pluginA.name} 需要用到该命名空间，你可以更改插件名（plugin.name = xxx）或者手动更改宿主 data 部分来处理冲突`);
            })
            .then(() => {
                const appWithConflictOfCustom = new BtApp({
                    pluginA: {
                        sayHelloOfApp() {
                            return { msg: 'hello, i am app' };
                        },
                    },
                });
                const error = t.throws(() => {
                    appWithConflictOfCustom.use(pluginA);
                });
                t.is(error.message, `[BeautyWe:error] theHost.${pluginA.name} 命名空间被占用了，插件 ${pluginA.name} 需要用到该命名空间，你可以更改插件名（plugin.name = xxx）或者手动处理冲突`);
            });
    });

    test.cb('[BtPlugin] beforeAttach', (t) => {
        const appInfo = {
            name: Symbol,
        };
        const pluginContent = {
            name: 'pluginA',
            data: {
                name: 'pluginA',
            },
            beforeAttach({ theHost }) {
                const plugin = this;
                t.is(plugin.name, pluginContent.data.name);
                t.is(theHost.name, appInfo.name);

                // theHost is still instanceof BtApp
                t.truthy(theHost instanceof BtApp);

                // custom method not ready
                t.is(theHost[plugin.name], undefined);

                // data, handlers not ready
                t.is(_.get(theHost, `data.${plugin.name}`), undefined);
                t.is(theHost.onClick, undefined);

                t.end();
            },
            customMethod: {
                sayHello() {
                    return { msg: 'hello', context: this };
                },
            },
            handler: {
                onClick() {
                    return 'clicked';
                },
            },
        };
        const pluginA = (pluginContent);
        const app = new BtApp(appInfo);

        app.use(pluginA);
    });

    test.cb('[BtPlugin] attached', (t) => {
        const appInfo = {
            name: Symbol,
        };
        const pluginContent = {
            name: 'pluginA',
            data: {
                name: 'pluginA',
            },
            attached({ theHost }) {
                const plugin = this;
                t.is(plugin.name, pluginContent.data.name);
                t.is(theHost.name, appInfo.name);

                // theHost is still instanceof BtApp
                t.truthy(theHost instanceof BtApp);

                // custom method not ready
                t.is(theHost[plugin.name], undefined);

                // data, handlers was ready
                t.deepEqual(_.get(theHost, `data.${plugin.name}`), pluginContent.data);
                t.is(typeof theHost.onClick, 'function');

                t.end();
            },
            customMethod: {
                sayHello() {
                    return { msg: 'hello', context: this };
                },
            },
            handler: {
                onClick() {
                    return 'clicked';
                },
            },
        };
        const pluginA = (pluginContent);
        const app = new BtApp(appInfo);

        app.use(pluginA);
    });

    test.cb('[BtPlugin] initialize', (t) => {
        const appInfo = {
            name: Symbol,
        };
        const pluginContent = {
            name: 'pluginA',
            data: {
                name: 'pluginA',
            },
            initialize({ theHost }) {
                const plugin = this;
                t.is(plugin.name, pluginContent.data.name);
                t.is(theHost.name, appInfo.name);

                // theHost is not instanceof BtApp anymore
                t.falsy(theHost instanceof BtApp);

                // custom method should ready
                t.is(typeof theHost[plugin.name].sayHello, 'function');

                // data, handlers was ready
                t.deepEqual(_.get(theHost, `data.${plugin.name}`), pluginContent.data);
                t.is(typeof theHost.onClick, 'function');

                t.end();
            },
            customMethod: {
                sayHello() {
                    return { msg: 'hello', context: this };
                },
            },
            handler: {
                onClick() {
                    return 'clicked';
                },
            },
        };
        const pluginA = (pluginContent);
        const app = new BtApp(appInfo);

        app.use(pluginA);

        // mock App
        class App {
            constructor(btApp) {
                Object.assign(this, btApp);
            }
        }
        const mockNativeAppInstance = new App(app);
        mockNativeAppInstance.onLaunch();
    });

    test.cb('[BtPlugin] name is required', (t) => {
        const error = t.throws(() => {
            const app = new BtApp();
            app.use({});
        });
        t.is(error.message, '[BeautyWe:error] params of name are required when create a BtPlugin.');
        t.end();
    });

    test.cb('[BtPlugin] use params is required', (t) => {
        const error = t.throws(() => {
            const app = new BtApp();
            app.use();
        });
        t.is(error.message, 'params is required');
        t.end();
    });

    test('[BtPlugin] should run funstacks in sequence', (t) => {
        const status = {
            timestamp: {
                onLoad: {
                    page: 0,
                    pluginA: 0,
                    pluginB: 0,
                },
            },
            customMethodBinded: false,
        };

        const page = new BtPage({
            onLoad() {
                if (this.pluginA.say && this.pluginB.say) {
                    status.customMethodBinded = true;
                }
                // eslint-disable-next-line prefer-destructuring
                status.timestamp.onLoad.page = process.hrtime()[1];
                return 'page';
            },
        });

        const pluginA = ({
            name: 'pluginA',
            nativeHook: {
                onLoad() {
                    // eslint-disable-next-line prefer-destructuring
                    status.timestamp.onLoad.pluginA = process.hrtime()[1];
                    return 'pluginA';
                },
            },
            customMethod: {
                say() {
                    console.log('I, am pluginA');
                },
            },
        });

        const pluginB = ({
            name: 'pluginB',
            nativeHook: {
                onLoad() {
                    // eslint-disable-next-line prefer-destructuring
                    status.timestamp.onLoad.pluginB = process.hrtime()[1];
                    return 'pluginB';
                },
            },
            customMethod: {
                say() {
                    console.log('I, am pluginB');
                },
            },
        });

        page.use(pluginA);
        page.use(pluginB);

        return Promise
            .resolve()
            .then(() => page.onLoad())
            .then((results) => {
                t.deepEqual(results, [
                    'page',
                    'pluginA',
                    'pluginB',
                ]);
                t.truthy(status.customMethodBinded);
                t.truthy(status.timestamp.onLoad.page < status.timestamp.onLoad.pluginA);
                t.truthy(status.timestamp.onLoad.pluginA < status.timestamp.onLoad.pluginB);
            });
    });

    test('[BtPage] should keep onLaunch onShow called in order', (t) => {
        const sayHello = [];
        const app = new BtApp({
            onLaunch() {
                sayHello.push('onLaunch');
            },
            onShow() {
                sayHello.push('onShow');
            },
        });

        return Promise
            .resolve()
            .then(() => Promise.all([
                app.onLaunch(),
                app.onShow(),
            ]))
            .then(() => {
                t.deepEqual(sayHello, ['onLaunch', 'onShow']);
            });
    });

    test('[BtPlugin] should throw error with confilc plugin useing', (t) => {
        const pluginA = {
            name: 'pluginA',
            handler: {
                onClick: () => 'hhh',
            },
        };

        const app = new BtApp({
            onClick: () => 'hhh',
        });


        t.notThrows(() => {
            app.use(pluginA);
        });

        const error = t.throws(() => {
            app.use(pluginA);
        });

        t.is(error.message, `[BeautyWe:error] ${pluginA.name} 已经注册了，不允许重复注册`);
    });

    test('[BtPlugin] wrong use way on use', (t) => {
        const app = new BtApp();
        t.notThrows(() => {
            app.use({
                name: 'pluginA',
                nativeHook: {
                    onShow: 'abc',
                    onClick() {
                        return 'hh';
                    },
                },
                handler: {
                    onShow: () => 'hhh',
                    onClick: 'abc',
                },
            });
        });
    });

    test.cb('[BtPlugin] throw error on native hook', (t) => {
        const app = new BtApp({
            onError(err) {
                t.is(err.message, 'error from onShow');
                t.end();
            },
        });
        app.use({
            name: 'pluginA',
            nativeHook: {
                onShow() {
                    throw new Error('error from onShow');
                },
            },
        });

        app.onLaunch().then(() => app.onShow()).catch((err) => {
            t.is(err.message, 'error from onShow');
        });
    });
}
