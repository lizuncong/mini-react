### react源码调试
`react` 源码使用 `rollup` 打包，将所有的模块都打包到一个文件中，比如 `react.development.js` 以及 `react-dom.development.js`，没有对应
的 `sourcemap`，导致阅读源码的过程当中无法得知源码位于哪个文件，如下图中红框内的源码无法映射到原文件，阅读体验不好。

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-01.jpg)

同时，`react` 在打包开发环境的代码时，会引入大量的本地调试代码

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-02.jpg)

这段代码对应的源码在于：packages/react/src/ReactDebugCurrentFrame.js文件中：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-03.jpg)

`react` 源码中大量使用 `__DEV__` 环境变量判断（参考：[__DEV__说明](https://zh-hans.reactjs.org/docs/codebase-overview.html#development-and-production)），如果是开发环境，则括号中的代码会被打包进产物中，如果是生产环境，则不会打包进产物中。这样
可以在开发环境注入一些调试代码，比如检查 `props` 是否合法、创建 `element` 的时候是否需要校验参数等情况：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-04.jpg)

实际上，这些开发时的校验代码与`react`主流程没有什么关系，我们不关心这些开发时的场景，只需要专注于主流程，因此如果打包时能够减少这部分代码，对我们阅读
体验来说还是相当不错的。


### 实现
修改 `react` 源码打包时 `rollup` 配置，然后终端运行：
```shell
yarn build react, shared, scheduler, react-reconciler, react-dom --type=NODE
```
打包完成，复制 `build/node_modules/react/cjs/react.development.js` 以及 
`build/node_modules/react-dom/cjs/react-dom.development.js`，在本地粘贴，本地调试时可以使用这两份源码

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


### 效果
最终，优化后，打包出来的代码体积，`react.development.js` 从原先的2334行，减少到1122行。`react-dom.development.js` 从原先的26263行
减少到20600行。
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-06.jpg)

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-07.jpg)

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/debug-08.jpg)


### 源码拆分
react打包出来的源码都在一份文件中，比如 `react-dom` 打包后的代码接近2万行，对于我，只要将源码位置信息注入到打包后的代码中，阅读体验就非常好了。有些同学可能还是习惯于将源码映射到不同的文件，那么也可以通过在 `rollup` 配置中，修改 `transform` 插件的逻辑，比如：
```js
  transform(source, id) {
    // 修改id
    id = id.replace('/Users/lizc/Documents/MYProjects/react/', '/Users/lizc/Documents/MYProjects/react/dist/')
    let sourceStr = source.replace(/['"]use strict["']/g, '');
    require('fs-extra').outputFile(id, sourceStr)

    return sourceStr;
  },
```
这个时候就会在根目录下生成一个`dist`文件夹，里面就是源码映射的文件