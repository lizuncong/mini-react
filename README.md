### 目录划分
- docs。react相关知识文档目录
- react。手写react源码目录，对应的官方react版本为17.0.1
- react-dom。手写react-dom源码目录，对应的官方react-dom版本为17.0.1

### react源码调试
- git clone下载react源码
- cd react进入react源码目录
- yarn build react, shared, scheduler, react-reconciler, react-dom --type=NODE
- cd build/node_modules/react
- yarn link
- cd build/node_modules/react-dom
- yarn link

- 然后创建一个新项目，比如mini-react
- 在mini-react中执行yarn link react react-dom即可

### React源码系列文档(基于React17.0.1版本)
- React Fiber工作原理
    + [手把手开发极简Fiber版本的React](https://github.com/lizuncong/mini-react/blob/master/docs/build_your_own_react.md)，译文，入门fiber的人类高质量文章

- React 合成事件原理
    + [JavaScript事件基础](https://github.com/lizuncong/mini-react/blob/master/docs/JavaScript%E4%BA%8B%E4%BB%B6%E5%9F%BA%E7%A1%80.md)
    + [React合成事件与原生事件的执行顺序，React17以后合成事件发生了什么变更](https://github.com/lizuncong/mini-react/blob/master/docs/react%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6%E4%B8%8E%E5%8E%9F%E7%94%9F%E4%BA%8B%E4%BB%B6%E6%89%A7%E8%A1%8C%E9%A1%BA%E5%BA%8F.md)
    + [如果没有React，如何从0到1模拟合成事件的机制]()
    + [React源码中合成事件的实现过程]()
- setState相关问题
    + [setState同步异步更新的问题](https://github.com/lizuncong/mini-react/blob/master/docs/setState%E5%90%8C%E6%AD%A5%E5%BC%82%E6%AD%A5%E6%9B%B4%E6%96%B0%E7%9A%84%E9%97%AE%E9%A2%98.md)



### 参考链接
- [react-in-depth](https://medium.com/react-in-depth)
- [inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react](https://indepth.dev/posts/1008/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react) 介绍react reconciliation 算法的好文章