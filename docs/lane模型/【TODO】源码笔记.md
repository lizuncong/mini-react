## 二进制操作

```js
x & -x; // 结果是x的二进制表示，最右边的1
0 & -0; // 0
1 & -1; // 1
2 & -2; // 2
24 & -24; // 8
```

## ReactRootTags.js

```js
var LegacyRoot = 0;
var BlockingRoot = 1;
var ConcurrentRoot = 2;
```

## ReactTypeOfMode

fiber.mode 的取值范围就是这几个 mode

```js
const NoMode = 0b00000;
const StrictMode = 0b00001;
// TODO: Remove BlockingMode and ConcurrentMode by reading from the root
// tag instead
const BlockingMode = 0b00010;
const ConcurrentMode = 0b00100;
const ProfileMode = 0b01000;
const DebugTracingMode = 0b10000;
```

ReactRootTag 会转换为 ReactTypeOfMode

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

  return createFiber(HostRoot, null, null, mode);
}
```

## 合成事件优先级 Event Priority

合成事件的优先级只有这三个

```js
const DiscreteEvent = 0;
const UserBlockingEvent = 1;
const ContinuousEvent = 2;
```

合成事件和优先级的对应关系存储在 eventPriorities 中，所有的事件和优先级的对应关系如下：

```js
const ContinuousEvent = [
  "abort",
  "animationend",
  "animationiteration",
  "animationstart",
  "canplay",
  "canplaythrough",
  "durationchange",
  "emptied",
  "encrypted",
  "ended",
  "error",
  "gotpointercapture",
  "load",
  "loadeddata",
  "loadedmetadata",
  "loadstart",
  "lostpointercapture",
  "playing",
  "progress",
  "seeking",
  "stalled",
  "suspend",
  "timeupdate",
  "transitionend",
  "waiting",
];
const UserBlockingEvent = [
  "drag",
  "dragenter",
  "dragexit",
  "dragleave",
  "dragover",
  "mousemove",
  "mouseout",
  "mouseover",
  "pointermove",
  "pointerout",
  "pointerover",
  "scroll",
  "toggle",
  "touchmove",
  "wheel",
];
const DiscreteEvent = [
  "cancel",
  "click",
  "close",
  "contextmenu",
  "copy",
  "cut",
  "auxclick",
  "dblclick",
  "dragend",
  "dragstart",
  "drop",
  "focusin",
  "focusout",
  "input",
  "invalid",
  "keydown",
  "keypress",
  "keyup",
  "mousedown",
  "mouseup",
  "paste",
  "pause",
  "play",
  "pointercancel",
  "pointerdown",
  "pointerup",
  "ratechange",
  "reset",
  "seeked",
  "submit",
  "touchcancel",
  "touchend",
  "touchstart",
  "volumechange",
  "change",
  "selectionchange",
  "textInput",
  "compositionstart",
  "compositionend",
  "compositionupdate",
];
```

## react 优先级 ReactPriorityLevel

下面是 react 优先级（reactPriorityLevel），react 优先级最终会转换成 Scheduler 的优先级。react 优先级和 Scheduler 优先级是一一对应的，只不过取值不同

```js
// Except for NoPriority, these correspond to Scheduler priorities. We use
// ascending numbers so we can compare them like numbers. They start at 90 to
// avoid clashing with Scheduler's priorities.
const ImmediatePriority = 99;
const UserBlockingPriority = 98;
const NormalPriority = 97;
const LowPriority = 96;
const IdlePriority = 95;
const NoPriority = 90;
```

## lane 优先级 LanePriority

```js
export const SyncLanePriority = 15;
export const SyncBatchedLanePriority = 14;

const InputDiscreteHydrationLanePriority = 13;
export const InputDiscreteLanePriority = 12;

const InputContinuousHydrationLanePriority = 11;
export const InputContinuousLanePriority = 10;

const DefaultHydrationLanePriority = 9;
export const DefaultLanePriority = 8;

const TransitionHydrationPriority = 7;
export const TransitionPriority = 6;

const RetryLanePriority = 5;

const SelectiveHydrationLanePriority = 4;

const IdleHydrationLanePriority = 3;
const IdleLanePriority = 2;

const OffscreenLanePriority = 1;

export const NoLanePriority = 0;
```

lane 优先级转换成 react 优先级：

```js
// 实际上这个函数名叫lanePriorityToReactPriority直观一点
function lanePriorityToSchedulerPriority(lanePriority) {
  switch (lanePriority) {
    case SyncLanePriority:
    case SyncBatchedLanePriority:
      return ImmediatePriority; // react调度优先级 99

    case InputDiscreteHydrationLanePriority:
    case InputDiscreteLanePriority:
    case InputContinuousHydrationLanePriority:
    case InputContinuousLanePriority:
      return UserBlockingPriority; // react调度优先级 98

    case DefaultHydrationLanePriority:
    case DefaultLanePriority:
    case TransitionHydrationPriority:
    case TransitionPriority:
    case SelectiveHydrationLanePriority:
    case RetryLanePriority:
      return NormalPriority; // react调度优先级 97

    case IdleHydrationLanePriority:
    case IdleLanePriority:
    case OffscreenLanePriority:
      return IdlePriority; // react调度优先级 95

    case NoLanePriority:
      return NoPriority;

    default: {
    }
  }
}
```

## 调度优先级

SchedulerPriority 调度优先级：

```js
Scheduler_ImmediatePriority：1；
Scheduler_UserBlockingPriority：2
Scheduler_NormalPriority：3
Scheduler_LowPriority：4
Scheduler_IdlePriority：5
```

react 优先级转换成调度优先级：

```js
function reactPriorityToSchedulerPriority(reactPriorityLevel) {
  switch (reactPriorityLevel) {
    case ImmediatePriority$1:
      return Scheduler_ImmediatePriority;

    case UserBlockingPriority$2:
      return Scheduler_UserBlockingPriority;

    case NormalPriority$1:
      return Scheduler_NormalPriority;

    case LowPriority$1:
      return Scheduler_LowPriority;

    case IdlePriority$1:
      return Scheduler_IdlePriority;

    default: {
    }
  }
}
```

> 总的来说就是，先将 lane 优先级转换成 react 优先级，react 优先级再转换成调度优先级

## lane 模型

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
```

## requestUpdateLane

- 1. 当前的 scheduler 优先级转换成 react 优先级
- 2. 当前的 react 优先级转换成 lane 优先级：schedulerPriorityToLanePriority，具体的转换关系如下：

```js
function schedulerPriorityToLanePriority(schedulerPriorityLevel) {
  switch (schedulerPriorityLevel) {
    case ImmediatePriority: // 99
      return SyncLanePriority; // 15

    case UserBlockingPriority: // 98
      return InputContinuousLanePriority; // 10

    case NormalPriority: // 97
    case LowPriority: // 96
      // TODO: Handle LowSchedulerPriority, somehow. Maybe the same lane as hydration.
      return DefaultLanePriority; // 8

    case IdlePriority: // 95
      return IdleLanePriority; // 2

    default:
      return NoLanePriority; // 0
  }
}
```

- 3. 根据当前 lane 优先级查找更新的 lane，从对应的lanes中找到最高优先级的lane
- 4. 根据 lane 创建对应的更新对象 update

## issues

- [https://programmer.group/exploring-the-inner-of-react-postmessage-scheduler.html](https://programmer.group/exploring-the-inner-of-react-postmessage-scheduler.html)

https://blog.crimx.com/2020/06/30/%E5%A6%82%E4%BD%95%E6%B5%8B%E8%AF%95-react-%E5%B9%B6%E5%8F%91%E6%A8%A1%E5%BC%8F%E5%AE%89%E5%85%A8/

https://opy-bbt.github.io/2020/06/13/%E4%BB%8E%E6%B5%8B%E8%AF%95%E7%9C%8Breact%E6%BA%90%E7%A0%81-scheduler/

https://twitter.com/dan_abramov/status/699395627264962561
