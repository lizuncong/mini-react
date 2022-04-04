### React中的优先级
不同事件产生的更新优先级不同
- 事件优先级：按照用户事件的交互紧急程度，划分的优先级
- 更新优先级：事件导致React产生的更新对象(update)的优先级(update.lane)
- 任务优先级：产生更新对象之后，React去执行一个更新任务，这个任务所持有的优先级
- 调度优先级：Scheduler依据React更新任务生成一个调度任务，这个调度任务所持有的优先级

>前三者属于React的优先级机制，第四个属于`scheduler`的优先级机制

### 事件优先级
- 离散事件(DiscreteEvent)：click、keydown等，这些事件的触发不是连续的，优先级为0
- 用户阻塞事件(UserBlockingEvent)：drag，scroll，mouseover等，特点是连续触发，阻塞渲染，优先级为1
- 连续事件(ContinuousEvent)：canplay、error、优先级最高，为2

src/react/packages/shared/ReactTypes.js
```js
export const DiscreteEvent = 0;
export const UserBlockingEvent = 1;
export const ContinuousEvent = 2;
```

src/react/packages/scheduler/src/Scheduler.js
```js
function unstable_runWithPriority(priorityLevel, eventHandler){
    switch(priorityLevel){
        case ImmediatePriority:
        case UserBlockingPriority:
        case NormalPriority:
        case LowPriority:
        case IdlePriority:
            break;    
    }
}
```

### 更新优先级
- setState本质上是调用enqueueSetState生成一个update对象，这时候会计算它的更新优先级，即update.lane
- 首先找出Scheduler中记录的优先级 schedulerPriority，然后计算更新优先级