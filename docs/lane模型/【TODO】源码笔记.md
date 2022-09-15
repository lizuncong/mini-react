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

```js
const DiscreteEvent: EventPriority = 0;
const UserBlockingEvent: EventPriority = 1;
const ContinuousEvent: EventPriority = 2;
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

## react 优先级

下面是 react 优先级（reactPriorityLevel）

```js
// Except for NoPriority, these correspond to Scheduler priorities. We use
// ascending numbers so we can compare them like numbers. They start at 90 to
// avoid clashing with Scheduler's priorities.
export const ImmediatePriority: ReactPriorityLevel = 99;
export const UserBlockingPriority: ReactPriorityLevel = 98;
export const NormalPriority: ReactPriorityLevel = 97;
export const LowPriority: ReactPriorityLevel = 96;
export const IdlePriority: ReactPriorityLevel = 95;
```

lane 优先级转换成 react 优先级：

```js
// 实际上这个函数名叫lanePriorityToReactPriority直观一点
function lanePriorityToSchedulerPriority(lanePriority) {
  switch (lanePriority) {
    case SyncLanePriority:
    case SyncBatchedLanePriority:
      return ImmediatePriority;

    case InputDiscreteHydrationLanePriority:
    case InputDiscreteLanePriority:
    case InputContinuousHydrationLanePriority:
    case InputContinuousLanePriority:
      return UserBlockingPriority;

    case DefaultHydrationLanePriority:
    case DefaultLanePriority:
    case TransitionHydrationPriority:
    case TransitionPriority:
    case SelectiveHydrationLanePriority:
    case RetryLanePriority:
      return NormalPriority;

    case IdleHydrationLanePriority:
    case IdleLanePriority:
    case OffscreenLanePriority:
      return IdlePriority;

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

## issues

- [https://programmer.group/exploring-the-inner-of-react-postmessage-scheduler.html](https://programmer.group/exploring-the-inner-of-react-postmessage-scheduler.html)

https://blog.crimx.com/2020/06/30/%E5%A6%82%E4%BD%95%E6%B5%8B%E8%AF%95-react-%E5%B9%B6%E5%8F%91%E6%A8%A1%E5%BC%8F%E5%AE%89%E5%85%A8/

https://opy-bbt.github.io/2020/06/13/%E4%BB%8E%E6%B5%8B%E8%AF%95%E7%9C%8Breact%E6%BA%90%E7%A0%81-scheduler/

https://twitter.com/dan_abramov/status/699395627264962561
