import React from 'react'
import ReactDOM from 'react-dom'
// import Counter from './Counter'
import { ClassComponent, HostRoot, HostComponent } from './ReactWorkTags';
import { NoMode, ConcurrentMode } from './ReactTypeOfMode'
import { NoLane, SyncLane } from './ReactFiberLane'
import { Component } from './ReactBaseClasses';
import { batchedUpdate } from './ReactFiberWorkLoop';

class Counter extends Component{
    constructor(props){
        super(props)
        this.state = {
            number: 0
        }
    }
    handleClick = (event) => {
        this.setState({ number: this.state.number + 1})
    }

    render(){
        console.log('render===', this.state)
        return (
            <div>
                <p>{this.state.number}</p>
                <button onClick={this.handleClick}>+</button>
            </div>
        )
    }
}

const container = document.getElementById('root')



const counterInstance = new Counter()
const mode = ConcurrentMode
// 根Fiber的mode会影响下面所有的子Fiber
// 每个Fiber会有一个updateQueue代表更新队列，源码里是个链表
const rootFiber = {
    tag: HostRoot,
    updateQueue: [],
    mode: mode
}


const counterFiber = {
    tag: ClassComponent,
    updateQueue: [],
    mode: mode
}

// fiber的stateNode指向类的实例
counterFiber.stateNode = counterInstance
// 组件实例的_reactInternal属性指向组件实例对应的Fiber
counterInstance._reactInternals = counterFiber
rootFiber.child = counterFiber
counterFiber.return = rootFiber

// 合成事件
document.addEventListener('click', (event) => {
    const syntheticEvent = { nativeEvent: event } // 根据原生事件创建合成事件
    // 源码里先通过事件，找到事件源，再通过事件源找到对应的处理函数
    // 这里为了简化，直接调用
    batchedUpdate(() => counterInstance.handleClick(syntheticEvent))
})

// 1. 并发模式下，setState都会合并，不管在哪里调用setState，更新都会合并，通过更新优先级合并的
// 2. 同步模式下，如果使用了batchedUpdates就会批量更新，不用就是同步更新。同步模式下，如果在setTimeout或者原生的事件中调用setState，则setState是同步的，如果想变成异步的，可以使用batchedUpdate方法包裹一下。