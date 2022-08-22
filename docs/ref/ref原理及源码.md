## 学习目标

- 为什么 React 不将 ref 存在 fiber 的 props 中，这样在组件中就能通过 props.ref 获取到值
- ref 的值什么时候设置，什么时候被释放？

## 前置知识

React Ref 用法可以看[这篇文章](https://github.com/lizuncong/mini-react/blob/master/docs/ref/ref%E5%8E%9F%E7%90%86%E5%8F%8A%E6%BA%90%E7%A0%81.md)

## React element 中的 ref 属性

React.createElement 对 ref 属性进行特殊处理

我们知道在构建时，JSX 经过 babel 编译为一系列 React.createElement，比如下面的代码

```jsx
<div ref={this.domRef} id="counter" name="test">
  dom ref
</div>
```

经过 babel 编译，变成下面的函数调用

```js
React.createElement(
  "div",
  {
    ref: this.domRef,
    id: "counter",
    name: "test",
  },
  "dom ref"
);
```

React.createElement 最终返回的是一个 react element 对象

```js
var RESERVED_PROPS = {
  key: true,
  ref: true,
};
function createElement(type, config, children) {
  var propName;

  var props = {};
  var key = null;
  var ref = null;

  if (config != null) {
    if (config.ref) {
      ref = config.ref;
    }

    if (config.key) {
      key = "" + config.key;
    }

    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        props[propName] = config[propName];
      }
    }
  }
  var childrenLength = arguments.length - 2;

  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);

    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }

    props.children = childArray;
  }

  return ReactElement(type, key, ref, ReactCurrentOwner.current, props);
}

var ReactElement = function (type, key, ref, owner, props) {
  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key,
    ref: ref,
    props: props,
    _owner: owner,
  };
};
```

可以看出，ref 属性和 key 属性一样都是比较特殊的，不会被添加到 props 中，这也是为什么我们通过 props.ref 或者 props.key 获取到的永远是 undefined 的原因

ref 和 key 都是直接添加到 fiber 的属性当中的。**为什么 React 不将 ref 存储在 props 中？**

## ref 对象

我们在使用 ref，必须显示的调用 React.createRef 或者 React.useRef 方法创建一个 ref 对象（回调 ref 不需要调用这两个方法）

这两个函数都比较简单，都是用于创建 ref 对象，比如：

```js
function createRef() {
  return {
    current: null,
  };
}
// 在函数组件初次渲染阶段，useRef就是mountRef
function mountRef(initialValue) {
  var hook = mountWorkInProgressHook();
  var ref = {
    current: initialValue,
  };

  hook.memoizedState = ref;
  return ref;
}

// 在函数组件更新阶段，useRef就是updateRef
function updateRef(initialValue) {
  var hook = updateWorkInProgressHook();
  return hook.memoizedState;
}
```

为什么 React 要采用对象保存 ref？这是因为对象是引用类型，方便存值，比如下面的例子中，我们给 div 传递了 ref 属性

```jsx
<div ref={this.domRef} id="counter" name="test">
  dom ref
</div>
```

this.domRef 是一个对象：

```js
this.domRef = { current };
```

在 render 阶段为 div 创建 fiber 节点时，会将 ref 设置给 fiber.ref，即`fiber.ref = this.domRef`，然后在 commit 阶段，React 会给 fiber.ref.current 设置 dom 实例，此时 this.domRef.current 也就可以访问到 dom 节点

## fiber ref 属性是什么时候设置的？

前面说过，React.createElement 在创建 react element 对象时，会将 ref 单独放在 element 对象的属性中，而不是放在 element.props 属性中，element 对象属性如下所示：

```js
{
  $$typeof: Symbol(react.element),
  key: null,
  props: { id: "counter", name: "test", children: "dom ref：0", onClick },
  ref: { current: null },
  type: "div",
};
```

在 render 阶段，React 会为当前的 fiber 协调子元素，即将当前 fiber 节点的子节点和新的子 element 节点比较，以创建新的 workInProgress 节点。其中，在协调时，会将 element 上的 ref 属性赋值给 fiber ref 属性，**fiber ref 属性就是在协调阶段设置的**。以下面的例子为例：

```jsx
<div id="container">
  <div ref={this.domRef} id="counter" name="test">
    dom ref
  </div>
</div>
```

在 beginWork 阶段，`div#container` 执行 reconcileChildren 工作，为 `div#counter` 创建子 fiber 节点，然后给新的 `div#counter` fiber 节点设置 ref 属性。伪代码如下：

```js
// returnFiber即 div#container，element即是新的div#counter对应的react element对象
// currentFirstChild是returnFiber的第一个子节点
function reconcileSingleElement(returnFiber, currentFirstChild, element) {
  if (!currentFirstChild) {
    // 第一次渲染
    var _created4 = createFiberFromElement(element, returnFiber.mode, lanes);
    _created4.ref = element.ref;
    _created4.return = returnFiber;
    return _created4;
  } else {
    var _existing3 = useFiber(child, element.props);
    _existing3.ref = element.ref;
    _existing3.return = returnFiber;
    return _existing3;
  }
}
```

从上面的代码可以看出，在 reconcile 阶段，无论是第一次渲染还是更新阶段，都会使用 element.ref 重新赋值给新的 fiber。区别在于，第一次渲染时，会调用 createFiberFromElement 创建新的 fiber 节点，而在更新阶段，会调用 useFiber 复用旧的 fiber 节点。

**因此，fiber ref 属性是在父节点的 reconcile 阶段被设置的**

## fiber ref 副作用标记

render 阶段如果满足下面两个条件之一，会为 fiber 节点添加一个 Ref 副作用标记：

- 第一次渲染，并且 ref 有值，即 current === null && ref !== null
- 更新阶段，即第二次或者后续的渲染中，如果 ref 发生了变化，即 current !== null && current.ref !== workInProgress.ref

下面是 HTML 元素和类组件的场景

```js
function beginWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case ClassComponent: {
      return updateClassComponent(current, workInProgress);
    }
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderLanes);
  }
}
function updateClassComponent(current, workInProgress) {
  //....
  var nextUnitOfWork = finishClassComponent(current, workInProgress);
  return nextUnitOfWork;
}

function finishClassComponent(current, workInProgress) {
  // 即使是shouldComponentUpdate返回了false，Ref也要更新
  markRef(current, workInProgress);
  //...
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  //...
  return workInProgress.child;
}
function updateHostComponent(current, workInProgress, renderLanes) {
  //...
  markRef(current, workInProgress);
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
function markRef(current, workInProgress) {
  var ref = workInProgress.ref;

  if (
    (current === null && ref !== null) ||
    (current !== null && current.ref !== ref)
  ) {
    // 添加一个 Ref 副作用（effect）
    workInProgress.flags |= Ref;
  }
}
```

从上面的代码可以看出，不管是类组件还是 HTML 元素的 fiber，在为他们调用 reconcileChildren 协调子元素之前，都会调用 markRef 判断是否为它们添加 Ref 副作用

## ref.current 属性赋值

在 render 阶段，会调用 markRef 为 fiber 节点添加 Ref 副作用。在 commit 阶段，React 会判断 fiber 是否具有 Ref 副作用，如果有，则为 fiber.ref 设置 current 值。

在[深入概述 React 初次渲染及状态更新主流程](https://github.com/lizuncong/mini-react/blob/master/docs/render/%E6%B7%B1%E5%85%A5%E6%A6%82%E8%BF%B0%20React%E5%88%9D%E6%AC%A1%E6%B8%B2%E6%9F%93%E5%8F%8A%E7%8A%B6%E6%80%81%E6%9B%B4%E6%96%B0%E4%B8%BB%E6%B5%81%E7%A8%8B.md)中介绍过，commit 分为三个小阶段：

- commitBeforeMutationEffects
- commitMutationEffects
- commitLayoutEffects

与 Ref 操作有关的阶段只有`commitMutationEffects`以及`commitLayoutEffects`

```js
function commitRootImpl(root, renderPriorityLevel) {
  //...
  commitBeforeMutationEffects();
  //...
  commitMutationEffects(root, renderPriorityLevel);
  //...
  commitLayoutEffects(root, lanes);
  //...
}
```

### commitMutationEffects：重置 ref 为 null

`commitMutationEffects`主要是执行节点的增删改操作，在执行这些操作之前，会先调用 commitDetachRef 重置 ref。

```js
function commitDetachRef(current) {
  var currentRef = current.ref;

  if (currentRef !== null) {
    if (typeof currentRef === "function") {
      currentRef(null);
    } else {
      currentRef.current = null;
    }
  }
}
function commitMutationEffects(root, renderPriorityLevel) {
  while (nextEffect !== null) {
    var flags = nextEffect.flags;

    //...

    if (flags & Ref) {
      var current = nextEffect.alternate;
      if (current !== null) {
        commitDetachRef(current);
      }
    }

    var primaryFlags = flags & (Placement | Update | Deletion | Hydrating);

    switch (primaryFlags) {
      //...
      case Deletion: {
        commitDeletion(root, nextEffect);
        break;
      }
    }
    nextEffect = nextEffect.nextEffect;
  }
}
```

这里，删除节点（commitDeletion）的操作比较特殊，commitDeletion 调用 unmountHostComponents 卸载节点，而 unmountHostComponents 最终又会调用 commitUnmount 卸载节点，在 commitUnmount 中会调用 safelyDetachRef 小心的重置 ref 为 null

```js
function safelyDetachRef(current) {
  var ref = current.ref;

  if (ref !== null) {
    if (typeof ref === "function") {
      try {
        ref(null);
      } catch (refError) {
        captureCommitPhaseError(current, refError);
      }
    } else {
      ref.current = null;
    }
  }
}
function commitUnmount(finishedRoot, current, renderPriorityLevel) {
  onCommitUnmount(current);

  switch (current.tag) {
    //...
    case ClassComponent: {
      safelyDetachRef(current);
      var instance = current.stateNode;
      if (typeof instance.componentWillUnmount === "function") {
        safelyCallComponentWillUnmount(current, instance);
      }
      return;
    }
    case HostComponent: {
      safelyDetachRef(current);
      return;
    }
  }
}
```

### commitLayoutEffects：为 ref 设置新值

commitLayoutEffects 会判断 fiber 是否具有 Ref 副作用，如果有，则调用 commitAttachRef 设置 ref 的值

```js
function commitLayoutEffects(root, committedLanes) {
  while (nextEffect !== null) {
    var flags = nextEffect.flags;

    //...

    if (flags & Ref) {
      commitAttachRef(nextEffect);
    }

    nextEffect = nextEffect.nextEffect;
  }
}
```

commitAttachRef 主要就是设置 ref 的值，这里会判断 ref 属性是否是函数，如果是函数，则执行。否则直接设置 ref.current 属性

```js
function commitAttachRef(finishedWork) {
  var ref = finishedWork.ref;

  if (ref !== null) {
    var instance = finishedWork.stateNode;

    if (typeof ref === "function") {
      ref(instance);
    } else {
      ref.current = instance;
    }
  }
}
```

## useImperativeHandle

### render 阶段

在 render 阶段，执行函数调用 useImperativeHandle 时，React 会为 forwardRef 创建一个 imperativeHandle 类型的 Effect 对象，并添加到 updateQueue 队列中，如下：

```js
function imperativeHandleEffect(create, ref) {
  if (typeof ref === "function") {
    var refCallback = ref;

    var _inst = create();

    refCallback(_inst);
    return function () {
      // 注意这里会返回一个函数!!!
      refCallback(null);
    };
  } else if (ref !== null && ref !== undefined) {
    var refObject = ref;

    var _inst2 = create();

    refObject.current = _inst2;
    return function () {
      refObject.current = null;
    };
  }
}
const imperativeEffect = {
  create: imperativeHandleEffect,
  deps: null,
  destroy: undefined,
  next: null,
  tag: 3,
};
imperativeEffect.next = imperativeEffect;

fiber.updateQueue = {
  lastEffect: imperativeEffect,
};
```

以下面的代码为例：

```jsx
const FunctionCounter = (props, ref) => {
  const createInst = () => ({
    focus: () => {
      console.log("focus...");
    },
  });
  useImperativeHandle(ref, createInst);
  return <div>{`计数器：${props.count}`}</div>;
};

const ForwardRefCounter = React.forwardRef(FunctionCounter);
```

`imperativeHandleEffect(create, ref)`中的第一个参数`create`对应`useImperativeHandle(ref, createInst);`中的第二个参数`createInst`。

`imperativeHandleEffect(create, ref)`中的第二个参数`ref`对应`useImperativeHandle(ref, createInst);`中的第一个参数`ref`。

> 注意，这里我们用 React.forwardRef 包裹 FunctionCounter，React 会为 forwardRef 创建一个 fiber 节点，但不会为 FunctionCounter 创建一个 fiber 节点。因此 render 阶段执行的工作是针对 forwardRef 类型的 fiber 节点

### commitLayoutEffects 阶段：设置 ref.current 的值

commitLayoutEffects 阶段调用 commitLifeCycles。注意，在 commitHookEffectListMount 中会遍历 fiber.updateQueue 的 effect 队列，然后执行 effect.create 方法，就是我们前面说过的 imperativeHandleEffect 方法。

```js
function commitLifeCycles(current, finishedWork) {
  switch (finishedWork.tag) {
    case ForwardRef: {
      commitHookEffectListMount(Layout | HasEffect, finishedWork);
      return;
    }
  }
}
function commitHookEffectListMount(tag, finishedWork) {
  var updateQueue = finishedWork.updateQueue;
  var lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

  if (lastEffect !== null) {
    var firstEffect = lastEffect.next;
    var effect = firstEffect;

    do {
      if ((effect.tag & tag) === tag) {
        // Mount
        var create = effect.create;
        effect.destroy = create(); // 调用effect.create
      }

      effect = effect.next;
    } while (effect !== firstEffect);
  }
}
```

在执行 imperativeHandleEffect 方法时，会返回一个函数：

```js
function imperativeHandleEffect(create, ref) {
  if (typeof ref === "function") {
    var refCallback = ref;

    var _inst = create();

    refCallback(_inst);
    return function () {
      // 注意这里会返回一个函数!!!
      refCallback(null);
    };
  } else if (ref !== null && ref !== undefined) {
    var refObject = ref;

    var _inst2 = create();

    refObject.current = _inst2;
    return function () {
      refObject.current = null;
    };
  }
}
```

这个函数就是用来重置 ref.current 属性为 null 的。返回函数会在 commitMutationEffects 阶段执行

### commitMutationEffects 阶段：重置 ref.current 为 null

commitMutationEffects 阶段调用 commitWork

```js
function commitWork(current, finishedWork) {
  switch (finishedWork.tag) {
    case ForwardRef:
      commitHookEffectListUnmount(Layout | HasEffect, finishedWork);
      return;
  }
}
function commitHookEffectListUnmount(tag, finishedWork) {
  var updateQueue = finishedWork.updateQueue;
  var lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;

  if (lastEffect !== null) {
    var firstEffect = lastEffect.next;
    var effect = firstEffect;

    do {
      if ((effect.tag & tag) === tag) {
        // Unmount
        var destroy = effect.destroy;
        effect.destroy = undefined;

        if (destroy !== undefined) {
          destroy();
        }
      }

      effect = effect.next;
    } while (effect !== firstEffect);
  }
}
```

> 从这个过程也可以看出，如果 ref 是一个函数，会被执行两次，第一次在 commitMutationEffects 阶段执行，用于重置 ref.current 为 null，第二次在 commitLayoutEffects 阶段执行，用于设置 ref.current 为最新的值
