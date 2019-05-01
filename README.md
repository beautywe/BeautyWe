<p align="center">
  <a href="https://beautywe.github.io/docs">
      <img src="https://img.yzcdn.cn/public_files/2019/04/27/49f46c53afd62f9cebcbcf13b091acbb.png?imageView2/2/h/180">
  </a>
</p>

<p align="center">
  Write beautiful code for wechat mini app by the beautiful we 👨‍💻‍!
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@beautywe/core">
    <img alt="NPM Size" src="https://img.shields.io/bundlephobia/minzip/@beautywe/core.svg">
  </a>
  <a href="https://www.npmjs.com/package/@beautywe/core">
    <img alt="NPM Version" src="https://img.shields.io/npm/v/@beautywe/core.svg">
  </a>
  <a href="https://www.npmjs.com/package/@beautywe/core">
    <img alt="NPM Version" src="https://img.shields.io/npm/dm/@beautywe/core.svg">
  </a>
</p>

<p align="center">
  <a href="https://circleci.com/gh/beautywe/beautywe">
    <img alt="CircleCI" src="https://img.shields.io/circleci/project/github/beautywe/beautywe/master.svg">
  </a>
  <a href='https://coveralls.io/github/beautywe/beautywe?branch=master'>
    <img src='https://coveralls.io/repos/github/beautywe/beautywe/badge.svg?branch=master' alt='Coverage Status' />
  </a>
</p>

<h3 align="center">
  <a href="https://beautywe.github.io/docs">📖 Document</a>
</h3>

## Intro

BeautyWe 是一套微信小程序的开发范式，它由几部分组成：

* **核心类库** - [**@beautywe/core**](https://www.npmjs.com/package/@beautywe/core)    
    对 App、Page 进行封装抽象，并且提供插件机制

* **插件生态** — [**@beautywe/plugin-xxx**](https://www.npmjs.com/search?q=keywords%3Abeautywe-plugin)    
官方以插件的模式提供了各种解决方案，如「增强存储」、「事件发布订阅」、「状态机」、「Error」、「Logger」等。

* **企业级框架** - [**@beautywe/framework**](https://www.npmjs.com/package/@beautywe/framework)    
    基于 `beautywe/core`，提供一套开箱即用的项目框架，包含开发规范、构建任务、配置、NPM 等解决方案。

* **自动化工具** - [**@beautywe/cli**](https://www.npmjs.com/package/@beautywe/cli)    
    提供「新建应用」、「新建页面」、「新建插件」、「项目构建」等任务的命令行工具，解放双手。

## Usage Example

```
npm i @beautywe/core @beautywe/plugin-event
```

```javascript
import { BtApp } from '@beautywe/core';
import event from '@beautywe/plugin-event';

const myApp = new BtApp({
    // the code as you write for App()
});

myApp.use(event());

App(myApp);
```

之后，你就能使用 `plugin-event` 提供的能力了：

```javascript
const app = getApp();

// now you can listening and trigger an event
myApp.event.on('hello', (msg) => console.log(msg));
myApp.event.trigger('hello', 'I am jc');
```

更多详细内容，请查看：[官方文档](https://beautywe.github.io/docs)

## License
[MIT](LICENSE)
