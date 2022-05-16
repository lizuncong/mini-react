### react 源码调试

react 官方提供的打包源码，本地调试的方法如下：

- git clone 下载 react 源码
- cd react 进入 react 源码目录
- yarn build react, shared, scheduler, react-reconciler, react-dom --type=NODE
- cd build/node_modules/react
- yarn link
- cd build/node_modules/react-dom
- yarn link

- 然后创建一个新项目，比如 mini-react
- 在 mini-react 中执行 yarn link react react-dom 即可

**这种方法对阅读源码来说体验相当不好！！！**

`react` 源码使用 `rollup` 打包，将所有的模块都打包到一个文件中，比如 `react.development.js` 以及 `react-dom.development.js`，没有对应
的 `sourcemap`，导致阅读源码的过程当中无法得知源码位于哪个文件，如下图中红框内的源码无法映射到原文件，阅读体验不好。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-01.jpg)

同时，`react` 在打包开发环境的代码时，会引入大量的本地调试代码

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-02.jpg)

这段代码对应的源码在于：packages/react/src/ReactDebugCurrentFrame.js 文件中：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-03.jpg)

`react` 源码中大量使用 `__DEV__` 环境变量判断（参考：[**DEV**说明](https://zh-hans.reactjs.org/docs/codebase-overview.html#development-and-production)），如果是开发环境，则括号中的代码会被打包进产物中，如果是生产环境，则不会打包进产物中。这样
可以在开发环境注入一些调试代码，比如检查 `props` 是否合法、创建 `element` 的时候是否需要校验参数等情况：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-04.jpg)

实际上，这些开发时的校验代码与`react`主流程没有什么关系，我们不关心这些开发时的场景，只需要专注于主流程，因此如果打包时能够减少这部分代码，对我们阅读
体验来说还是相当不错的。

### 方案一：添加源码位置信息以及去掉开发环境校验代码

在打包后的 react.development.js 以及 react-dom.development.js 中添加源码位置信息，以及去掉 `__DEV__` 相关的代码

首先，让我们简单修改一下 react 打包配置，打开源码中 scripts/rollup/build.js

```javascript
// Remove 'use strict' from individual source files.
{
  transform(source, id) {
    id = id.replace('/Users/lizc/Documents/MYProjects/react/', '')
    let sourceStr = source.replace(/['"]use strict["']/g, '');

    sourceStr = `/***************** debugger ${id} == start *****************/\n${source}\n/***************** debugger ${id} == end *****************/`
    return sourceStr;
  },
},
// Turn __DEV__ and process.env checks into constants.
replace({
  __DEV__: 'false', // isProduction ? 'false' : 'true',
  __PROFILE__: isProfiling || !isProduction ? 'true' : 'false',
  __UMD__: isUMDBundle ? 'true' : 'false',
  'process.env.NODE_ENV': isProduction ? "'production'" : "'development'",
  __EXPERIMENTAL__: false,
  // __EXPERIMENTAL__,
  // Enable forked reconciler.
  // NOTE: I did not put much thought into how to configure this.
  __VARIANT__: bundle.enableNewReconciler === true,
}),
```

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-05.jpg)

然后终端运行打包命令：

```shell
yarn build react, shared, scheduler, react-reconciler, react-dom --type=NODE
```

打包完成，复制 `build/node_modules/react/cjs/react.development.js` 以及
`build/node_modules/react-dom/cjs/react-dom.development.js`，在本地粘贴，本地调试时可以使用这两份源码

### 效果

最终，优化后，打包出来的代码体积，`react.development.js` 从原先的 2334 行，减少到 1122 行。`react-dom.development.js` 从原先的 26263 行
减少到 20600 行。
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-06.jpg)

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-07.jpg)

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-08.jpg)

### 方案二：源码拆分

我们先来看下执行 react 官方提供的打包命令后，打包后的源码，终端运行：

```shell
yarn build react, shared, scheduler, react-reconciler, react-dom --type=NODE
```

当你回车后，可想而知漫长的等待。。。。

大概 5 分多钟后。。。。。。打包完成，我们看下打包后的结果：

`node_modules` 下出现了很多的模块，但其实我们只需要 `react`、`react-dom` 这两个模块

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/build-01.jpg)

展开 `react` 或者 `react-dom`，会发现 `cjs` 目录下又有很多文件，我们只需要 `cjs/react.development.js` 以及 `cjs/react-dom.development.js` 这两个文件
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-09.jpg)

我们知道 `rollup` 打包时需要配置 `entry` 入口文件，因此我们可以从这里入手，打开 scripts/rollup/bundles.js 文件，找到 `const bundles`，如下：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-09.jpg)

将 `const bundles` 修改成 `let bundles`，并在下面覆盖掉它：

```js
bundles = [
  {
    bundleTypes: [
      // UMD_DEV,
      // UMD_PROD,
      // UMD_PROFILING,
      NODE_DEV,
      // NODE_PROD,
      // FB_WWW_DEV,
      // FB_WWW_PROD,
      // FB_WWW_PROFILING,
      // RN_FB_DEV,
      // RN_FB_PROD,
      // RN_FB_PROFILING,
    ],
    moduleType: ISOMORPHIC,
    entry: "react",
    global: "React",
    externals: [],
  },
  {
    bundleTypes: [
      // UMD_DEV,
      // UMD_PROD,
      // UMD_PROFILING,
      NODE_DEV,
      // NODE_PROD,
      // NODE_PROFILING,
      // FB_WWW_DEV,
      // FB_WWW_PROD,
      // FB_WWW_PROFILING,
    ],
    moduleType: RENDERER,
    entry: "react-dom",
    global: "ReactDOM",
    externals: ["react"],
  },
];
```

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-11.jpg)

在终端执行打包命令：

```shell
yarn build react, shared, scheduler, react-reconciler, react-dom --type=NODE
```

这一次不用一分钟，打包速度提升很快，然后再看看打包后的目录：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-12.jpg)

完美，打包后的目录非常赶紧了，打包速度也提升很多。下面我们再看看如何进行源码映射。

回到 scripts/rollup/build.js 中，修改 `transform` 插件，我们将打包后的源码拆分到 `dist` 目录下：

```js
{
  transform(source, id) {
    // 修改id
    id = id.replace('/Users/lizc/Documents/MYProjects/react/', '/Users/lizc/Documents/MYProjects/react/dist/')
    let sourceStr = source.replace(/['"]use strict["']/g, '');
    require('fs-extra').outputFile(id, sourceStr)

    return sourceStr;
  },
},
```

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-13.jpg)

执行打包命令，打包完成后我们会看到在当前目录下有个 `dist` 目录：
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-14.jpg)

可以看到只有简单的几个包，实际上这些包就是我们的 `react`、`react-dom` 两个文件的包及其依赖。这样在我们看代码时就少了很多干扰。实际上源码中那些 `react-native`、`react-client` 等包我们是根本不需要关注的。

对于我们的阅读源码体验来说，可以说是很不错了。
