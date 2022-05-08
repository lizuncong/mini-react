![Issues](https://img.shields.io/github/issues/lizuncong/mini-react)
![Forks](https://img.shields.io/github/forks/lizuncong/mini-react)
![Stars](https://img.shields.io/github/stars/lizuncong/mini-react)

### 目录划分

- docs。react 相关知识文档&源码剖析目录
- react。手写 react 源码目录，对应的官方 react 版本为 17.0.1
- react-dom。手写 react-dom 源码目录，对应的官方 react-dom 版本为 17.0.1
- react-reconciler。手写 react-reconciler 源码目录，对应的官方 react-reconciler 版本为 17.0.1

### React 源码系列文档(基于 React17.0.1 版本)

- [提高 React 源码 debug 体验舒适度的一些奇淫技巧](https://github.com/lizuncong/mini-react/blob/master/docs/how_to_debug_react_source_code.md)

- React 工作原理
  这目录下的文章均是译文，对理解 react 工作原理有很大的启发作用

  - [手把手开发极简 Fiber 版本的 React](https://github.com/lizuncong/mini-react/blob/master/docs/%E8%AF%91%E6%96%87/build_your_own_react.md)，译文，入门 fiber 的人类高质量文章
  - [Fiber 内部：React 中新的协调算法的深入概述](https://github.com/lizuncong/mini-react/blob/master/docs/%E8%AF%91%E6%96%87/in-depth_overview_of_the_new_reconciliation_algorithm.md)

- 第一阶段 React 合成事件原理
  - [JavaScript 事件基础](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6/JavaScript%E4%BA%8B%E4%BB%B6%E5%9F%BA%E7%A1%80.md)
  - [React 合成事件与原生事件的执行顺序，React17 以后合成事件有哪些变更](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6/react%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6%E4%B8%8E%E5%8E%9F%E7%94%9F%E4%BA%8B%E4%BB%B6%E6%89%A7%E8%A1%8C%E9%A1%BA%E5%BA%8F.md)
  - [极简版合成事件](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6/%E4%BB%8E0%E5%88%B01%E6%A8%A1%E6%8B%9F%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6.md)
  - [React 源码中合成事件的实现过程](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6/React%E6%BA%90%E7%A0%81%E4%B8%AD%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6%E7%9A%84%E5%AE%9E%E7%8E%B0%E8%BF%87%E7%A8%8B.md)
  - [React 合成事件源码中浏览器兼容相关 API 收录](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6/%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6%E6%BA%90%E7%A0%81%E4%B8%AD%E6%B5%8F%E8%A7%88%E5%99%A8%E5%85%BC%E5%AE%B9%E7%9B%B8%E5%85%B3%E7%9A%84API.md)
- 第二阶段 Hooks

  - [React.useReducer 原理及源码主流程](https://github.com/lizuncong/mini-react/blob/master/docs/hooks/how_useReducer_work.md)

- 第三阶段 Class Component
  - [React 批量&同步更新场景](https://github.com/lizuncong/mini-react/blob/master/docs/setState%E5%90%8C%E6%AD%A5%E5%BC%82%E6%AD%A5%E6%9B%B4%E6%96%B0%E7%9A%84%E9%97%AE%E9%A2%98.md)
  - [Class Component setState 主流程及源码，类组件与函数组件对应的 fiber.memoizedState 的区别](https://github.com/lizuncong/mini-react/blob/master/docs/class/how_setstate_works.md)
  - [React 批量&同步更新原理及主流程源码](https://github.com/lizuncong/mini-react/blob/master/docs/hooks/how_batchedUpdates_work.md)
- 第四阶段 Reconciler
  - [Dom Diff 算法简介](https://github.com/lizuncong/mini-react/blob/master/docs/reconciler/dom-diff%E7%AE%97%E6%B3%95%E7%AE%80%E4%BB%8B.md)

### 参考链接

- [react-in-depth](https://medium.com/react-in-depth)
- [inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react](https://indepth.dev/posts/1008/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react) 介绍 react reconciliation 算法的好文章
- [scheduling-in-react](https://philippspiess.com/scheduling-in-react/)
- [react.jokcy.me](https://react.jokcy.me/book/api/react-children.html)
- [react 源码](https://xiaochen1024.com/courseware/60b1b2f6cf10a4003b634718/60b1b55ccf10a4003b634728)
- [react 源码环境](https://github.com/Terry-Su/debug-react-source-code)
- [https://overreacted.io/](https://overreacted.io/)
