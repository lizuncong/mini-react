![Issues](https://img.shields.io/github/issues/lizuncong/mini-react)
![Forks](https://img.shields.io/github/forks/lizuncong/mini-react)
![Stars](https://img.shields.io/github/stars/lizuncong/mini-react)

> 如果对 react 源码感兴趣的朋友，可以从下面的 TODO 待办项中找一项，以此为发力点解析 React 源码。如果有什么好的外文需要翻译，也可以加到 TODO 中。或者觉得什么文章好，也欢迎提 PR 收录进来。希望能一起对文章质量把关，一起共建社区最好的 react 源码生态环境。

### 目录划分

- docs。react 相关知识文档&源码剖析目录
- react。手写 react 源码目录，对应的官方 react 版本为 17.0.1
- react-dom。手写 react-dom 源码目录，对应的官方 react-dom 版本为 17.0.1
- react-reconciler。手写 react-reconciler 源码目录，对应的官方 react-reconciler 版本为 17.0.1

### React 源码系列文档(基于 React17.0.1 版本)

- [提高 React 源码 debug 体验舒适度的一些奇淫技巧](https://github.com/lizuncong/mini-react/blob/master/docs/how_to_debug_react_source_code.md)

- React 工作原理

  对理解 react 工作原理有很大的启发作用

  - [手把手开发极简 Fiber 版本的 React](https://github.com/lizuncong/mini-react/blob/master/docs/%E8%AF%91%E6%96%87/build_your_own_react.md)
  - [Fiber 内部：React 中新的协调算法的深入概述](https://github.com/lizuncong/mini-react/blob/master/docs/%E8%AF%91%E6%96%87/in-depth_overview_of_the_new_reconciliation_algorithm.md)
  - [React 中 state 和 props 更新的深入讲解](https://github.com/lizuncong/mini-react/blob/master/docs/%E8%AF%91%E6%96%87/in-depth-explanation-of-state-and-props-update-in-react.md)
  - [React 是如何防止 XSS 攻击的，论$$typeof 的作用](https://github.com/lizuncong/mini-react/blob/master/docs/%E8%AF%91%E6%96%87/how_to_prevent_xss.md)
  - [【TODO】类组件和函数组件最大的区别](https://github.com/lizuncong/mini-react/blob/master/docs/%E8%AF%91%E6%96%87/function_component_class_component_difference.md)
  - [【TODO】组件名称首字母为啥一定要大写](https://github.com/lizuncong/mini-react/blob/master/docs/%E8%AF%91%E6%96%87/component-identifiers-must-be-capitalized-in-react.md)
  - [深入概述 React 初次渲染及状态更新主流程](https://github.com/lizuncong/mini-react/blob/master/docs/render/%E6%B7%B1%E5%85%A5%E6%A6%82%E8%BF%B0%20React%E5%88%9D%E6%AC%A1%E6%B8%B2%E6%9F%93%E5%8F%8A%E7%8A%B6%E6%80%81%E6%9B%B4%E6%96%B0%E4%B8%BB%E6%B5%81%E7%A8%8B.md)

  - [React17 与 React18 源码之间的差别](https://github.com/lizuncong/mini-react/blob/master/docs/React17%E4%B8%8EReact18%E6%BA%90%E7%A0%81%E4%B9%8B%E9%97%B4%E7%9A%84%E5%B7%AE%E5%BC%82.md)

- React 合成事件原理

  - [JavaScript 事件基础](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6/JavaScript%E4%BA%8B%E4%BB%B6%E5%9F%BA%E7%A1%80.md)
  - [React 合成事件与原生事件的执行顺序，React17 以后合成事件有哪些变更](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6/react%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6%E4%B8%8E%E5%8E%9F%E7%94%9F%E4%BA%8B%E4%BB%B6%E6%89%A7%E8%A1%8C%E9%A1%BA%E5%BA%8F.md)
  - [极简版合成事件](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6/%E4%BB%8E0%E5%88%B01%E6%A8%A1%E6%8B%9F%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6.md)
  - [React 源码中合成事件的实现过程](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6/React%E6%BA%90%E7%A0%81%E4%B8%AD%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6%E7%9A%84%E5%AE%9E%E7%8E%B0%E8%BF%87%E7%A8%8B.md)
  - [React 合成事件源码中浏览器兼容相关 API 收录](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6/%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6%E6%BA%90%E7%A0%81%E4%B8%AD%E6%B5%8F%E8%A7%88%E5%99%A8%E5%85%BC%E5%AE%B9%E7%9B%B8%E5%85%B3%E7%9A%84API.md)
  - [【TODO】React 如何实现 mouseenter 和 mouseleave 事件代理](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6/mouseenter_delegate.md)

- Hooks

  - [React.useReducer 原理及源码主流程](https://github.com/lizuncong/mini-react/blob/master/docs/hooks/how_useReducer_work.md)
  - [从源码的角度分析 useLayoutEffect 及 useEffect 的区别](https://github.com/lizuncong/mini-react/blob/master/docs/hooks/%E4%BB%8E%E6%BA%90%E7%A0%81%E7%9A%84%E8%A7%92%E5%BA%A6%E7%90%86%E8%A7%A3useEffect%E4%BB%A5%E5%8F%8AuseLayoutEffect%E7%9A%84%E5%8C%BA%E5%88%AB.md)
  - [彻底搞懂函数组件 hook 链表](https://github.com/lizuncong/mini-react/blob/master/docs/hooks/%E5%BD%BB%E5%BA%95%E6%90%9E%E6%87%82%E5%87%BD%E6%95%B0%E7%BB%84%E4%BB%B6hook%E9%93%BE%E8%A1%A8.md)

- Class Component

  - [React 批量&同步更新场景](https://github.com/lizuncong/mini-react/blob/master/docs/class/setState%E5%90%8C%E6%AD%A5%E5%BC%82%E6%AD%A5%E6%9B%B4%E6%96%B0%E7%9A%84%E9%97%AE%E9%A2%98.md)
  - [Class Component setState 主流程及源码，类组件与函数组件对应的 fiber.memoizedState 的区别](https://github.com/lizuncong/mini-react/blob/master/docs/class/how_setstate_works.md)
  - [React 批量&同步更新原理及主流程源码](https://github.com/lizuncong/mini-react/blob/master/docs/hooks/how_batchedUpdates_work.md)

- Reconciler

  - [Dom Diff 算法简介](https://github.com/lizuncong/mini-react/blob/master/docs/reconciler/dom-diff%E7%AE%97%E6%B3%95%E7%AE%80%E4%BB%8B.md)
  - [单节点 Dom Diff 算法简介](https://github.com/lizuncong/mini-react/blob/master/docs/reconciler/%E5%8D%95%E8%8A%82%E7%82%B9dom-diff%E7%AE%97%E6%B3%95.md)
  - [多节点 Dom Diff 算法及 Commit 阶段节点移动插入更新删除等源码剖析](https://github.com/lizuncong/mini-react/blob/master/docs/reconciler/%E5%A4%9A%E8%8A%82%E7%82%B9dom-diff%E7%AE%97%E6%B3%95.md)
  - [构建副作用链表算法，为什么 React 不采用数组保存具有副作用的 Fiber 节点？](https://github.com/lizuncong/mini-react/blob/master/docs/reconciler/%E6%9E%84%E5%BB%BA%E5%89%AF%E4%BD%9C%E7%94%A8%E9%93%BE%E8%A1%A8%E7%AE%97%E6%B3%95.md)
  - [Dom diff 所有场景介绍](https://github.com/lizuncong/mini-react/blob/master/docs/reconciler/dom-diff%E6%89%80%E6%9C%89%E5%9C%BA%E6%99%AF.md)

- Fiber

  - [updateQueue 在不同类型的 Fiber 节点的含义](https://github.com/lizuncong/mini-react/blob/master/docs/fiber/fiber.updateQueue.md)
  - [盘点 fiber 中常见的副作用标志 flags](https://github.com/lizuncong/mini-react/blob/master/docs/fiber/%E7%9B%98%E7%82%B9fiber%E4%B8%AD%E5%B8%B8%E8%A7%81%E7%9A%84%E5%89%AF%E4%BD%9C%E7%94%A8%E6%A0%87%E5%BF%97flags.md)
  - [33 张图爆肝介绍 Fiber 双缓冲树机制](https://github.com/lizuncong/mini-react/blob/master/docs/fiber/fiber%E5%8F%8C%E7%BC%93%E5%86%B2%E6%A0%91.md)
  - [Ref 原理及源码解析](./docs/ref/ref%E5%8E%9F%E7%90%86%E5%8F%8A%E6%BA%90%E7%A0%81.md)

- Hydrate 服务端渲染

  - [React Hydrate 原理及源码剖析](https://github.com/lizuncong/mini-react/blob/master/docs/hydrate/hydrate%E6%BA%90%E7%A0%81%E5%89%96%E6%9E%90.md)

- 异常捕获

  - [全网最详细的 React 异常捕获机制及源码，为什么在开发环境下，React 不使用 try catch，而是自己模拟了 try catch 的效果？](https://github.com/lizuncong/mini-react/blob/master/docs/%E5%BC%82%E5%B8%B8/React%E5%BC%82%E5%B8%B8%E6%8D%95%E8%8E%B7%E6%9C%BA%E5%88%B6%E5%8F%8A%E6%BA%90%E7%A0%81.md)

- React Context 设计哲学

  - [手撕 React Context 源码设计哲学](https://github.com/lizuncong/mini-react/blob/master/docs/ReactContext/context%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%90.md)

- React Scheduler

  - 【手写 Scheduler 源码系列文章第一篇】[哪些 API 适合用于调度任务](./docs/schedule/%E5%93%AA%E4%BA%9BAPI%E9%80%82%E5%90%88%E7%94%A8%E4%BA%8E%E4%BB%BB%E5%8A%A1%E8%B0%83%E5%BA%A6.md)。介绍`requestAnimationFrame`、`requestIdleCallback`、`setTimeout`、`MessageChannel`、`MutationObserver`等基础用法及特性，看看哪些 API 会适合任务调度
  - 【手写 Scheduler 源码系列文章第二篇】[scheduler 用法详解](./docs/schedule/scheduler%E7%94%A8%E6%B3%95%E8%AF%A6%E8%A7%A3.md)
  - 【手写 Scheduler 源码系列文章第三篇】[scheduler 原理及源码手写](./docs/schedule/%E6%89%8B%E5%86%99scheduler%E6%BA%90%E7%A0%81.md)。介绍任务切片、时间切片原理、为什么使用 Message Channel 而不是 setTimeout 等调度任务？
  - 【手写 Scheduler 源码系列文章第四篇】[scheduer 优先级调度原理及源码手写](./docs/schedule/%E6%89%8B%E5%86%99scheduler%E6%BA%90%E7%A0%81%E4%B9%8B%E4%BC%98%E5%85%88%E7%BA%A7.md)
  - 【手写 Scheduler 源码系列文章第五篇】[scheduer 延迟任务原理及源码手写](./docs/schedule/%E6%89%8B%E5%86%99scheduler%E6%BA%90%E7%A0%81%E4%B9%8B%E5%BB%B6%E8%BF%9F%E4%BB%BB%E5%8A%A1.md)
  - 【手写 Scheduler 源码系列文章终章】[scheduler 核心源码精讲](./docs/schedule/schedule%E6%A0%B8%E5%BF%83%E6%BA%90%E7%A0%81%E7%B2%BE%E8%AE%B2.md)

- lane 模型

  在看 lane 模型前，请先确保已经熟悉 React Scheduler 任务调度原理及用法

### 参考链接

- [React 作者 Dan Abramov 的博客](https://overreacted.io/)
- [Fiber 内部：深入概述 React 中新的协调算法](https://indepth.dev/posts/1008/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react)
- [medium.com](https://medium.com/react-in-depth)

### 关于作者

实干家，不贩卖焦虑，不写水文不吹水。业余时间会根据兴趣看些框架源码，有时间就写写文章。有兴趣的网友可以扫码加个好友一起聊聊人生(备注 react 源码)

<center><img src="https://github.com/lizuncong/mini-react/blob/master/imgs/wechat-02.jpeg" width="30%"></center>

如果觉得写得好，点个 star 或者 follow 满足一下男人的虚荣心。心情好的话同时有点小钱，也可以请我喝个小茶开心一下。写得差的话就轻点喷，我会连夜改，真的

<center><img src="https://github.com/lizuncong/mini-react/blob/master/imgs/wechat-01.jpeg" width="30%"></center>
