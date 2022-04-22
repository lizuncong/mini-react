### 环状链表

### hook链表
### 流程
- 初次挂载，即第一次执行
- 点击按钮触发setState执行，构造updateQueue链表
- 更新流程


- performUnitOfWork。fiber 节点开始工作的入口。
- performUnitOfWork 调用 beginWork
- beginWork 里面会根据 workInProgress.tag 判断应该是调用 mountIndeterminateComponent 还是 updateFunctionComponent。这两个方法里面都会调用 renderWithHooks 方法以及 reconcileChildren 方法

- renderWithHooks 方法是组件执行逻辑的关键，这个方法的逻辑如下：
  - 三件关键的准备工作：
    - 将全局的 currentlyRenderingFiber 指针指向当前工作的 fiber 节点：currentlyRenderingFiber = workInProgress
    - 重置 fiber 的 hook 链表：currentlyRenderingFiber.memoizedState = null;
    - 设置 ReactCurrentDispatcher.current = current === null ? HooksDispatcherOnMount : HooksDispatcherOnUpdate。这个对象里面包含了 React 提供的所有 hook。当我们在组件中调用 useReducer 时，实际上就是通过这个对象调用的。
  - 调用组件方法 children = Component(props, secondArg)，实际上就是执行的我们的函数组件。hook 的逻辑就从这里开始。初次挂载组件和更新组件逻辑不一样，初次挂载组件时，需要为组件对应的fiber节点初始化hook链表
    - mountState(initialState)。如果是初次挂载，则调用 mountState
      - 调用 mountWorkInProgressHook 初始化 hook 链表以及 hook 指针。 currentlyRenderingFiber.memoizedState = workInProgressHook = hook = { memoizedState: null, baseState: null,baseQueue: null, queue: null, next: null }。注意，hook 中也有一个 memoizedState，这个 hook.memoizedState 是 hook 的 state 值，即 const [count, setCount] = useState(0)中的 count.memoizedState 指向的却是函数组件的 hook 链表的第一个 hook 节点。hook.next 指向下一个 hook。
    - 初始化 hook.queue，这就是 hook 更新队列，即多次调用 setCount，会往队列里添加更新。hook.queue = {pending: null, dispatch: null,lastRenderedReducer: basicStateReducer,lastRenderedState: initialState};
  - 函数组件执行完成。重置指针 currentlyRenderingFiber = null;currentHook = null;workInProgressHook = null;
  - 将函数组件执行结果，即 children 返回


- updateFunctionComponent。调用 renderWithHooks方法，然后调用updateState方法走更新的逻辑，updateState调用updateReducer，实际上updateReducer是更新阶段useState hook的主要逻辑
  + updateWorkInProgressHook。需要注意，在根据react element节点创建新的fiber节点时，此时的fiber节点复用了旧的fiber节点的hook链表。但是在renderWithHooks方法中，新的fiber节点的workInProgress.memoizedState = null 被重置为null。然后在updateWorkInProgressHook重新生成hook链表。因此不管是初次挂载阶段还是更新阶段，都要重新生成hook链表
