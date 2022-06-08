import ReactSharedInternals from "@shared/ReactSharedInternals";
import {
  Update as UpdateEffect,
  Passive as PassiveEffect,
} from './ReactFiberFlags';
import {
  HasEffect as HookHasEffect,
  Layout as HookLayout,
  Passive as HookPassive,
} from './ReactHookEffectTags'
// import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";

let workInProgressHook = null; // 当前工作中的新的hook指针
let currentHook = null; // 当前的旧的hook指针
let currentlyRenderingFiber; // workInProgress的别名
const { ReactCurrentDispatcher } = ReactSharedInternals;

function mountState(initialState) {
  const hook = mountWorkInProgressHook();
  hook.memoizedState = hook.baseState = initialState;
  const queue = (hook.queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer, // 用于判断useState调用多次，设置相同的值，不会触发重新渲染，比如多次setState(2)
    lastRenderState: initialState, // 和上面的lastRenderedReducer一样用于判断useState调用多次，设置相同的值，不会触发重新渲染，比如多次setState(2)
  });
  const dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue);
  return [hook.memoizedState, dispatch];
}
function basicStateReducer(state, action) {
  return typeof action === "function" ? action(state) : action;
}
function mountEffect(create, deps) {
  return mountEffectImpl(UpdateEffect | PassiveEffect, HookPassive, create, deps);
}
function mountLayoutEffect(create, deps) {
  return mountEffectImpl(UpdateEffect, HookLayout, create, deps);
}
function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  currentlyRenderingFiber.flags |= fiberFlags;
  // useEffect对应的hook对象的memoizedState存放的是 effect 的信息
  // QUESTION：既然 hook.memoizedState 已经存放的是 effect 链表，为啥还要搞一个fiber.updateQueue再存一份
  hook.memoizedState = pushEffect(HookHasEffect | hookFlags, create, undefined, nextDeps);
}
function pushEffect(tag, create, destroy, deps) {
  const effect = {
    tag: tag,
    create: create,
    destroy: destroy,
    deps: deps,
    // Circular
    next: null
  };
  let componentUpdateQueue = currentlyRenderingFiber.updateQueue;

  if (componentUpdateQueue === null) {
    componentUpdateQueue = createFunctionComponentUpdateQueue();
    currentlyRenderingFiber.updateQueue = componentUpdateQueue;
    componentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    const lastEffect = componentUpdateQueue.lastEffect;

    if (lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      componentUpdateQueue.lastEffect = effect;
    }
  }

  return effect;
}
function createFunctionComponentUpdateQueue() {
  return {
    lastEffect: null
  };
}
// function updateState(initialState) {
//   return updateReducer(basicStateReducer, initialState);
// }
// function updateReducer(reducer, initialState) {
//   // 更新时也要构建一个新的hook链表
//   const hook = updateWorkInProgressHook();
//   const queue = hook.queue; // 更新队列
//   const lastRenderedReducer = queue.lastRenderedReducer; // 上一次reducer方法

//   const current = currentHook;
//   const pendingQueue = queue.pending;
//   if (pendingQueue !== null) {
//     // 根据旧的状态和更新队列里的更新对象计算新的状态
//     const first = pendingQueue.next; // 第一个更新对象
//     let newState = current.memoizedState; // 旧的状态
//     let update = first;
//     do {
//       const action = update.action;
//       newState = reducer(newState, action);
//       update = update.next;
//     } while (update !== null && update !== first);
//     queue.pending = null; // 更新完成，清空链表
//     hook.memoizedState = newState; // 让新的hook对象的memoizedState等于计算的新状态
//     queue.lastRenderState = newState;
//   }
//   const dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue);
//   return [hook.memoizedState, dispatch];
// }
// function updateWorkInProgressHook() {
//   let nextCurrentHook;
//   if (currentHook === null) {
//     // 如果currentHook为null，说明这是第一个hook
//     const current = currentlyRenderingFiber.alternate; // 旧的fiber节点
//     nextCurrentHook = current.memoizedState; // 旧的fiber的memoizedState指向旧的hook链表的第一个节点
//   } else {
//     nextCurrentHook = currentHook.next;
//   }

//   currentHook = nextCurrentHook;

//   const newHook = {
//     memoizedState: currentHook.memoizedState,
//     queue: currentHook.queue,
//     next: null,
//   };

//   if (workInProgressHook === null) {
//     // 说明这是第一个hook
//     currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
//   } else {
//     workInProgressHook.next = newHook;
//     workInProgressHook = workInProgressHook.next = newHook;
//   }
//   return workInProgressHook;
// }
// export function useReducer(reducer, initialState) {
//   return ReactCurrentDispatcher.current.useReducer(reducer, initialState);
// }
// export function useState(initialState) {
//   return ReactCurrentDispatcher.current.useState(initialState);
// }
export function renderWithHooks(
  current,
  workInProgress,
  Component,
  props,
  secondArg,
  nextRenderLanes
) {
  currentlyRenderingFiber = workInProgress;
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  ReactCurrentDispatcher.current =
    current === null || current.memoizedState === null
      ? HooksDispatcherOnMount
      : HooksDispatcherOnUpdate;
  const children = Component(props, secondArg);
  currentlyRenderingFiber = null;
  workInProgressHook = null;
  currentHook = null;
  return children;
}

function mountWorkInProgressHook() {
  const hook = {
    // 创建一个hook对象
    memoizedState: null, // 自己的状态
    baseState: null,
    baseQueue: null,
    queue: null, // 自己的更新队列，环形列表
    next: null, // 下一个更新
  };
  if (workInProgressHook === null) {
    // This is the first hook in the list
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    workInProgressHook = workInProgressHook.next = hook;
  }

  return workInProgressHook;
}

const HooksDispatcherOnMount = {
  useEffect: mountEffect,
  useLayoutEffect: mountLayoutEffect,
  // useReducer: mountReducer,
  useState: mountState,
};
const HooksDispatcherOnUpdate = {
  // useEffect: updateEffect,
  // useLayoutEffect: updateLayoutEffect,
  // useReducer: updateReducer,
  useState: () => { }, //updateState,
};
// function mountReducer(reducer, initialState) {
//   // 构建hooks单向链表
//   const hook = mountWorkInProgressHook();
//   hook.memoizedState = initialState;
//   const queue = (hook.queue = { pending: null }); // 更新队列
//   const dispatch = dispatchAction.bind(null, currentlyRenderingFiber, queue);
//   return [hook.memoizedState, dispatch];
// }

function dispatchAction(currentlyRenderingFiber, queue, action) {
  // const update = { action, next: null };
  // const pending = queue.pending;
  // if (pending === null) {
  //   update.next = update;
  // } else {
  //   update.next = pending.next;
  //   pending.next = update;
  // }
  // queue.pending = update;
  // const lastRenderedReducer = queue.lastRenderedReducer; // 上一次的reducer
  // const lastRenderState = queue.lastRenderState; // 上一次的state
  // const eagerState = lastRenderedReducer(lastRenderState, action); // 计算新的state
  // if (Object.is(eagerState, lastRenderState)) {
  //   return;
  // }
  // scheduleUpdateOnFiber(currentlyRenderingFiber);
}