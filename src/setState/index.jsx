// import React from 'react'
// import ReactDOM from 'react-dom'
import Counter from './Couter'
import { NoMode, ConcurrentMode } from './ReactTypeOfMode'
import { ClassComponent, HostRoot } from './ReactWorkTag'
import { batchedUpdate } from './ReactFiberWorkLoop'

const counterInstance = new Counter()

const mode = NoMode // 同步模式， 如果用了batchedUpdate就会批量更新，不用就是同步更新
// const mode = ConcurrentMode // 并发模式 setState会合并，都是异步的，通过更新优先级合并的

// 根fiber的mode会影响下面所有的子fiber
// 每个fiber都会有一个updateQueue代表更新队列
const rootFiber = {
    tag: HostRoot,
    updateQueue: [],
    mode
}

const counterFiber = {
    tag: ClassComponent,
    updateQueue: [],
    mode
}

counterFiber.stateNode = counterInstance
counterInstance._reactInternal = counterFiber
rootFiber.child = counterFiber
counterFiber.return = rootFiber

document.addEventListener('click', (event) => {
    const syntheticEvent = { nativeEvent: event }

    batchedUpdate(() => counterInstance.handleClick(syntheticEvent))
})