import React from 'react'
import { IndeterminateComponent } from './ReactWorkTags'
import { render } from './ReactFiberWorkLoop'
import { useReducer } from './ReactFiberHooks'

function reducer(state, action){
    if(action.type === 'add'){
        return state + 1
    } else {
        return state
    }
}

const Counter = () => {
    debugger
    const [count, dispatch] = useReducer(reducer, 0)
    return (
        <div onClick={() => dispatch({ type: 'add' })}>
            计数器：{count}
        </div>
    )
}

const counterFiber = {
    tag: IndeterminateComponent,
    type: Counter,
    alternate: null,
}

render(counterFiber)
