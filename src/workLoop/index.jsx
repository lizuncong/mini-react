import React from 'react'

const style = { color: 'green', border: '1px solid red', margin: '5px' }
const virtualDOM = (
    <div key="A" style={style}>A
        <div key="B1" style={style}>B1</div>
        <div key="B2" style={style}>B2</div>
    </div>
)

// 开始工作循环


let workInProgress
const TAG_ROOT = 'TAG_ROOT'
const TAG_HOST = 'TAG_HOST' // 指的是原生DOM节点
function workLoop(){
    while(workInProgress){
        workInProgress = performUnitOfWork(workInProgress)
    }
}


let rootFiber = {
    tag: TAG_ROOT,
    key: 'ROOT',
    stateNode: root,
    props: { children: [virtualDOM] }
}

function performUnitOfWork(workInProgress){
    console.log('workInProgress.key===', workInProgress.key)
    beginWork(workInProgress)
    if(workInProgress.child){
        return workInProgress.child
    }
}

// 根据当前的Fiber和虚拟DOM构建Fiber树
function beginWork(workInProgress){
    console.log('beginWork===', workInProgress.key, workInProgress)
    const nextChildren = workInProgress.props.children
    return reconcileChildren(workInProgress, nextChildren)
}

function reconcileChildren(returnFiber, nextChildren){
    let previousNewFiber
    let firstChildFiber = null
    for(let newIndex = 0; newIndex < nextChildren.length; newIndex++){
        const newFiber = createFiber(nextChildren[newIndex])
        newFiber.return = returnFiber
        if(!firstChildFiber){
            firstChildFiber = newFiber
        } else {
            previousNewFiber.sibling = newFiber
        }
        previousNewFiber = newFiber
    }
    returnFiber.child = firstChildFiber
    return firstChildFiber
}

function createFiber(element){
    return {
        tag: TAG_HOST,
        type: element.type,
        key: element.key,
        props: element.props
    }
}
workInProgress = rootFiber

workLoop()