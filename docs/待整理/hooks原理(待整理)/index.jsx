import React from 'react'
import ReactDOM from 'react-dom'
import { IndeterminateComponent } from './ReactWorkTags'
import { render } from './ReactFiberWorkLoop.js'
import { useReducer } from './ReactFiberHooks'

const reducer = (state, action) => {
    if(action.type === 'add'){
        return state + 1
    }
    return state
}
function Counter(){
    const [number, setNumber] = useReducer(reducer, 0)
    return (
        <div onClick={() => {
            setNumber({ type: 'add' })
            setNumber({ type: 'add' })
            setNumber({ type: 'add' })
        }}>
            {number}
        </div>
    )
}

const counterFiber = {
    tag: IndeterminateComponent, // Fiber的类型，函数组件在初次渲染的时候对应的类型是IndeterminateComponent
    type: Counter,
    alternate: null
}

render(counterFiber)

// ReactDOM.render(<Counter />, document.getElementById('root'))