## 错误边界

关于错误边界的定义，可以看[React 官方文档](https://reactjs.org/docs/error-boundaries.html)

错误边界是 React 组件，而且只能是 Class 组件。如果一个 class 组件中定义了 static getDerivedStateFromError() 或 componentDidCatch() 这两个生命周期方法中的任意一个（或两个）时，那么它就变成一个错误边界

错误边界只会捕获下列几种异常，这也是 React 能够处理的异常：

- 子组件树渲染期间的错误，比如调用类组件的 render 方法，执行函数组件等
- 生命周期方法中的错误，比如类组件的所有生命周期方法，函数组件的 useEffect、useLayoutEffect 等 hook
- 构造函数中的错误

错误边界无法捕获以下场景中产生的错误：

- 事件处理
- 异步代码，例如 setTimeout 或 requestAnimationFrame 回调函数
- 服务端渲染
- 错误边界组件自身抛出来的错误

**自 React 16 起，任何未被错误边界捕获的错误将会导致整个 React 组件树被卸载。这里所说的错误指的是 render 阶段抛出的错误，包括 render 函数、生命周期方法、构造函数等。事件处理，异步代码里未被捕获的异常并不会导致页面崩溃**

React 不需要错误边界来捕获事件处理器中的错误。与 render 方法和生命周期方法不同，事件处理器不会在渲染期间触发。因此，如果它们抛出异常，React 仍然能够知道需要在屏幕上显示什么。
