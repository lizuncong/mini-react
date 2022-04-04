import React, { useReducer } from 'react'
import ReactDOM from 'react-dom'

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


ReactDOM.render(<Counter />, document.getElementById('root'))
