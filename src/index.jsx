import React from 'react'
import ReactDOM from 'react-dom'

class App extends React.Component {
    parentRef = React.createRef();
    childRef = React.createRef();
    constructor(props){
        super(props)
    }
    componentDidMount(){
      this.parentRef.current.addEventListener('click', () => {
        console.log('父元素原生捕获')
      }, true)
      this.parentRef.current.addEventListener('click', () => {
        console.log('父元素原生冒泡')
      })
      this.childRef.current.addEventListener('click', () => {
        console.log('子元素原生捕获')
      }, true)
      this.childRef.current.addEventListener('click', () => {
        console.log('子元素原生冒泡')
      })
      document.addEventListener('click', () => {
        console.log('document捕获')
      }, true)
      document.addEventListener('click', () => {
        console.log('document冒泡')
      })
      const root = document.getElementById('root')

      root.addEventListener('click', () => {
        console.log('root原生事件捕获')
      }, true)
      root.addEventListener('click', () => {
        console.log('root原生事件冒泡')
      })
    }
  
    parentBubble = () => {
      console.log('父元素React事件冒泡')
    }
    childBubble = () => {
      console.log('子元素React事件冒泡')
    }
    parentCapture = () => {
      console.log('父元素React事件捕获')
    }
    childCapture = () => {
      console.log('子元素React事件捕获')
    }
  
    render(){
      return (
        <div ref={this.parentRef} onClick={this.parentBubble} onClickCapture={this.parentCapture}>
          <p ref={this.childRef} onClick={this.childBubble} onClickCapture={this.childCapture}>
            事件执行顺序
          </p>
        </div>
      )
    }
}
ReactDOM.render(<App />, document.getElementById('root'))