## ReactRootTags

- LegacyRoot：0
- ConcurrentRoot：2
- BlockingRoot：1

## ReactTypeOfMode

fiber.mode 的取值范围如下：

```js
export const NoMode = 0b00000; // 0
export const StrictMode = 0b00001; // 1
// TODO: Remove BlockingMode and ConcurrentMode by reading from the root
// tag instead
export const BlockingMode = 0b00010; // 2
export const ConcurrentMode = 0b00100; // 4
export const ProfileMode = 0b01000; // 8
export const DebugTracingMode = 0b10000; // 16
```

实际上在 react17 中采用的是 ReactRootTag，因此为了兼容以前的 fiber.mode，这里做了个转换

```js
function createHostRootFiber(tag) {
  var mode;

  if (tag === ConcurrentRoot) {
    mode = ConcurrentMode | BlockingMode | StrictMode;
  } else if (tag === BlockingRoot) {
    mode = BlockingMode | StrictMode;
  } else {
    mode = NoMode;
  }

  if (isDevToolsPresent) {
    mode |= ProfileMode;
  }

  return createFiber(HostRoot, null, null, mode);
}
```

## lane

lane 的枚举定义在 ReactFiberLane.js 文件中

```js
const TotalLanes = 31;

export const NoLanes: Lanes = /*                        */ 0b0000000000000000000000000000000; // 0
export const NoLane: Lane = /*                          */ 0b0000000000000000000000000000000; // 0

export const SyncLane: Lane = /*                        */ 0b0000000000000000000000000000001; // 1
export const SyncBatchedLane: Lane = /*                 */ 0b0000000000000000000000000000010; // 2

export const InputDiscreteHydrationLane: Lane = /*      */ 0b0000000000000000000000000000100; // 4
const InputDiscreteLanes: Lanes = /*                    */ 0b0000000000000000000000000011000; // 24

const InputContinuousHydrationLane: Lane = /*           */ 0b0000000000000000000000000100000; // 32
const InputContinuousLanes: Lanes = /*                  */ 0b0000000000000000000000011000000; // 192

export const DefaultHydrationLane: Lane = /*            */ 0b0000000000000000000000100000000; // 256
export const DefaultLanes: Lanes = /*                   */ 0b0000000000000000000111000000000; // 3584

const TransitionHydrationLane: Lane = /*                */ 0b0000000000000000001000000000000; // 4096
const TransitionLanes: Lanes = /*                       */ 0b0000000001111111110000000000000; // 4186112

const RetryLanes: Lanes = /*                            */ 0b0000011110000000000000000000000; // 62914560

export const SomeRetryLane: Lanes = /*                  */ 0b0000010000000000000000000000000; // 33554432

export const SelectiveHydrationLane: Lane = /*          */ 0b0000100000000000000000000000000; // 67108864

const NonIdleLanes = /*                                 */ 0b0000111111111111111111111111111; // 134217727

export const IdleHydrationLane: Lane = /*               */ 0b0001000000000000000000000000000; // 134217728
const IdleLanes: Lanes = /*                             */ 0b0110000000000000000000000000000; // 805306368

export const OffscreenLane: Lane = /*                   */ 0b1000000000000000000000000000000; // 1073741824

export const NoTimestamp = -1;
```

```js
function requestUpdateLane(fiber) {
  // Special cases
  var mode = fiber.mode;

  if ((mode & BlockingMode) === NoMode) {
    return SyncLane;
  } else if ((mode & ConcurrentMode) === NoMode) {
    return getCurrentPriorityLevel() === ImmediatePriority$1
      ? SyncLane
      : SyncBatchedLane;
  } // The algorithm for assigning an update to a lane should be stable for all
  // updates at the same priority within the same event. To do this, the inputs
  // to the algorithm must be the same. For example, we use the `renderLanes`
  // to avoid choosing a lane that is already in the middle of rendering.
  //
  // However, the "included" lanes could be mutated in between updates in the
  // same event, like if you perform an update inside `flushSync`. Or any other
  // code path that might call `prepareFreshStack`.
  //
  // The trick we use is to cache the first of each of these inputs within an
  // event. Then reset the cached values once we can be sure the event is over.
  // Our heuristic for that is whenever we enter a concurrent work loop.
  //
  // We'll do the same for `currentEventPendingLanes` below.

  if (currentEventWipLanes === NoLanes) {
    currentEventWipLanes = workInProgressRootIncludedLanes;
  }

  var isTransition = requestCurrentTransition() !== NoTransition;

  if (isTransition) {
    if (currentEventPendingLanes !== NoLanes) {
      currentEventPendingLanes =
        mostRecentlyUpdatedRoot !== null
          ? mostRecentlyUpdatedRoot.pendingLanes
          : NoLanes;
    }

    return findTransitionLane(currentEventWipLanes, currentEventPendingLanes);
  } // TODO: Remove this dependency on the Scheduler priority.
  // To do that, we're replacing it with an update lane priority.

  var schedulerPriority = getCurrentPriorityLevel(); // The old behavior was using the priority level of the Scheduler.
  // This couples React to the Scheduler internals, so we're replacing it
  // with the currentUpdateLanePriority above. As an example of how this
  // could be problematic, if we're not inside `Scheduler.runWithPriority`,
  // then we'll get the priority of the current running Scheduler task,
  // which is probably not what we want.

  var lane;

  if (
    // TODO: Temporary. We're removing the concept of discrete updates.
    (executionContext & DiscreteEventContext) !== NoContext &&
    schedulerPriority === UserBlockingPriority$2
  ) {
    lane = findUpdateLane(InputDiscreteLanePriority, currentEventWipLanes);
  } else {
    var schedulerLanePriority =
      schedulerPriorityToLanePriority(schedulerPriority);

    lane = findUpdateLane(schedulerLanePriority, currentEventWipLanes);
  }

  return lane;
}
```

## React Fiber WorkLoop Context

在 react-reconciler/src/ReactFiberWorkLoop.js 中定义

```js
const NoContext = /*             */ 0b0000000; // 0
const BatchedContext = /*               */ 0b0000001; // 1
const EventContext = /*                 */ 0b0000010; // 2
const DiscreteEventContext = /*         */ 0b0000100; // 4
const LegacyUnbatchedContext = /*       */ 0b0001000; // 8 不批量执行，走的是workloopsync
const RenderContext = /*                */ 0b0010000; // 16
const CommitContext = /*                */ 0b0100000; // 32
const RetryAfterError = /*       */ 0b1000000; // 64
```

## FiberRootNode 属性

```js
function FiberRootNode(containerInfo, tag, hydrate) {
  this.tag = tag; // ReactRootTags，取值（LegacyRoot：0；ConcurrentRoot：2；BlockingRoot：1）
  this.containerInfo = containerInfo;
  this.pendingChildren = null;
  this.current = null;
  this.pingCache = null;
  this.finishedWork = null;
  this.timeoutHandle = noTimeout;
  this.context = null;
  this.pendingContext = null;
  this.hydrate = hydrate;
  this.callbackNode = null;

  this.callbackPriority = NoLanePriority;
  this.eventTimes = [0, ..., 0]; // 31个0
  this.expirationTimes = [-1, ..., -1]; // 31个-1
  // lane相关的属性
  this.pendingLanes = NoLanes;
  this.suspendedLanes = NoLanes;
  this.pingedLanes = NoLanes;
  this.expiredLanes = NoLanes;
  this.mutableReadLanes = NoLanes;
  this.finishedLanes = NoLanes;

  this.entangledLanes = NoLanes;
  this.entanglements = [0, ..., 0]; // 31个0
}
```

## Fiber 属性

```js
function FiberNode(tag, pendingProps, key, mode) {
  this.tag = tag; // HostRoot、HostComponent、FunctionComponent等
  this.mode = mode; // ReactTypeOfMode取值(NoMode：0；ConcurrentMode：4等等)
  // ...
  // lane相关的属性
  this.lanes = NoLanes;
  this.childLanes = NoLanes;
}
```

## markUpdateLaneFromFiberToRoot

将当前更新的 lane 合并到 fiber.lanes 中，同时也合并到 fiber.alternate.lanes

## 参考链接

- [https://dev.to/okmttdhr/what-is-lane-in-react-4np7](- https://dev.to/okmttdhr/what-is-lane-in-react-4np7)
- [scheduling-in-react](https://philippspiess.com/scheduling-in-react/)
- [lane 的 pr](https://github.com/facebook/react/pull/18796)
- [https://qdmana.com/2022/115/202204251040514197.html](https://qdmana.com/2022/115/202204251040514197.html)
- [https://www.youtube.com/c/JSerJSer](https://www.youtube.com/c/JSerJSer)
- [https://segmentfault.com/a/1190000039134817](https://segmentfault.com/a/1190000039134817)
