import React, { useState } from 'react'

const Counter = () => {
    const [count, setCount] = useState(1)
    return (
        <div 
            style={{ marginTop: '100px' }}
            onClick={() => {
                debugger
                setCount(count + 1)
            }}
        >
            {
                count % 3 === 1 ?
                <div id="count dom">{ count }</div>
                : 'click'
            }
        </div>
    )
}

export default Counter