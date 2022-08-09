```js
const FiberRootNode = {
  callbackNode: null,
  containerInfo, // div#root
  context: null,
  current: null,
  finishedWork: null,
  hydrate: false,
  tag: 0,
};
```

在 updateContainer 方法中，初始化 FiberRootNode.context = {}

### ClassComponent
