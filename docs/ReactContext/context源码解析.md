## 【草稿状态】正在解析进行中

## TODO

contextStackCursor 存的是什么

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

```js
function updateClassComponent(current, workInProgress, Component) {
  prepareToReadContext(workInProgress, renderLanes);
  var instance = workInProgress.stateNode;
  var shouldUpdate;

  if (instance === null) {
    constructClassInstance(workInProgress, Component, nextProps);
    mountClassInstance(workInProgress, Component, nextProps, renderLanes);
  } else if (current === null) {
    shouldUpdate = resumeMountClassInstance(workInProgress, Component);
  } else {
    shouldUpdate = updateClassInstance(current, workInProgress, Component);
  }

  var nextUnitOfWork = finishClassComponent(current, workInProgress, Component);

  return nextUnitOfWork;
}

function mountClassInstance() {
  var contextType = ctor.contextType;

  if (typeof contextType === "object" && contextType !== null) {
    instance.context = readContext(contextType);
  } else {
    var unmaskedContext = getUnmaskedContext(workInProgress, ctor, true);
    instance.context = getMaskedContext(workInProgress, unmaskedContext);
  }
}
function readContext(context, observedBits) {
  if (lastContextWithAllBitsObserved === context);
  else if (observedBits === false || observedBits === 0);
  else {
    var resolvedObservedBits; // Avoid deopting on observable arguments or heterogeneous types.

    if (
      typeof observedBits !== "number" ||
      observedBits === MAX_SIGNED_31_BIT_INT
    ) {
      // Observe all updates.
      lastContextWithAllBitsObserved = context;
      resolvedObservedBits = MAX_SIGNED_31_BIT_INT;
    } else {
      resolvedObservedBits = observedBits;
    }

    var contextItem = {
      context: context,
      observedBits: resolvedObservedBits,
      next: null,
    };

    if (lastContextDependency === null) {
      if (!(currentlyRenderingFiber !== null)) {
        {
          throw Error(formatProdErrorMessage(308));
        }
      } // This is the first dependency for this component. Create a new list.

      lastContextDependency = contextItem;
      currentlyRenderingFiber.dependencies = {
        lanes: NoLanes,
        firstContext: contextItem,
        responders: null,
      };
    } else {
      // Append a new context item.
      lastContextDependency = lastContextDependency.next = contextItem;
    }
  }

  return context._currentValue;
}
function constructClassInstance(workInProgress, ctor, props) {
  var contextType = ctor.contextType;

  if (typeof contextType === "object" && contextType !== null) {
    context = readContext(contextType);
  }

  var instance = new ctor(props, context);
  var state = (workInProgress.memoizedState =
    instance.state !== null && instance.state !== undefined
      ? instance.state
      : null);
  adoptClassInstance(workInProgress, instance);
  // ReactFiberContext usually updates this cache but can't for newly-created instances.

  if (isLegacyContextConsumer) {
    cacheContext(workInProgress, unmaskedContext, context);
  }

  return instance;
}

// 没有和context有关的操作
function finishClassComponent() {
  return workInProgress.child;
}
```

### Context.Provider

```js
var valueStack = [];
var valueCursor = { current: null };

// 先把当前值压入栈，value：context._currentValue
function push(cursor, value) {
  index++;
  valueStack[index] = cursor.current;

  cursor.current = value;
}
function pushProvider(providerFiber, nextValue) {
  var context = providerFiber.type._context;

  push(valueCursor, context._currentValue);
  context._currentValue = nextValue;
}
function updateContextProvider(current, workInProgress, renderLanes) {
  pushProvider(workInProgress, workInProgress.pendingProps.value);

  if (oldProps !== null) {
    var oldValue = oldProps.value;
    var changedBits = calculateChangedBits(context, newValue, oldValue);

    if (changedBits === 0) {
      // No change. Bailout early if children are the same.
      if (oldProps.children === newProps.children && !hasContextChanged()) {
        return bailoutOnAlreadyFinishedWork(
          current,
          workInProgress,
          renderLanes
        );
      }
    } else {
      // The context value changed. Search for matching consumers and schedule
      // them to update.
      propagateContextChange(workInProgress, context, changedBits, renderLanes);
    }
  }
  reconcileChildren(current, workInProgress, newProps.children, renderLanes);
  return workInProgress.child;
}
```

### completeunitofwork

```js
function pop(cursor, fiber) {
  if (index < 0) {
    return;
  }

  cursor.current = valueStack[index];
  valueStack[index] = null;

  index--;
}
function popProvider(providerFiber) {
  var currentValue = valueCursor.current;
  pop(valueCursor);
  var context = providerFiber.type._context;

  context._currentValue = currentValue;
}
function completeWork(current, workInProgress) {
  switch (workInProgress.tag) {
    case ContextProvider:
      // Pop provider fiber
      popProvider(workInProgress);
      return null;
  }
}
```
