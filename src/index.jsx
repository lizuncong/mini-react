import React from '@react'
import ReactDOM from 'react-dom'


const element = (
    <div 
        key={{ a: 'hello' }} 
        id="title"
    >
        title
    </div>
)

console.log(element)

ReactDOM.render(element, document.getElementById('root'))