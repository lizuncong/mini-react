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

### React相关知识文档
- [React合成事件](https://github.com/lizuncong/mini-react/blob/master/docs/react%E5%90%88%E6%88%90%E4%BA%8B%E4%BB%B6.md)
- [setState同步异步更新的问题](https://github.com/lizuncong/mini-react/blob/master/docs/setState%E5%90%8C%E6%AD%A5%E5%BC%82%E6%AD%A5%E6%9B%B4%E6%96%B0%E7%9A%84%E9%97%AE%E9%A2%98.md)
- [手把手开发极简Fiber版本的React](https://github.com/lizuncong/mini-react/blob/master/docs/build_your_own_react.md)