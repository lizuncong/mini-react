import React from 'react'
import ReactDOM from 'react-dom'
import Counter from './Couter'
import { NoMode, ConcurrentMode } from './ReactTypeOfMode'
import { ClassComponent, HostRoot } from './ReactWorkTag'

const counterInstance = new Counter()

const mode = NoMode

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