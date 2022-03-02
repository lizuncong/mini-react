import React from './react'
import ReactDOM from './react-dom'

const root = document.getElementById('root')

const handleDivClick = () => {
    console.log('父元素冒泡')
}

const handleDivClickCapture = event => {
    console.log('父元素捕获')
}

const handleButtonClick = event => {
    console.log('子元素冒泡')
}

const handleButtonClickCapture = () => {
    console.log('子元素捕获')
}

const element = (
    <div onClick={handleDivClick} onClickCapture={handleDivClickCapture}>
        <button onClick={handleButtonClick} onClickCapture={handleButtonClickCapture}>点击</button>
    </div>
)
console.log('element...', element)

ReactDOM.render(
    element,
    root
)