### setState
- 不能直接通过`this.state.number = 2`修改state的值来让界面发生更新
- React并没有实现类似于Vue的依赖收集来监听数据的变化
- 因此必须通过setState告知React数据已经发生了变化
- this.setState(arg1, callback)。arg1既可以是对象，也可以是函数，如果是函数，则该函数必须返回一个对象

### 异步更新
- React在执行setState的时候会把更新的内容放入队列
- 在事件执行结束后会计算state的数据，然后执行回调
- 最后根据最新的state计算虚拟DOM更新真实DOM
- 异步更新的优点
    + 保持内部一致性。如果改为同步更新的方式，尽管setState变成了同步，但是props不是
    + 为后续的架构升级启用并发更新，React会在setState时，根据它们的数据来源分配不同的优先级，这些数据来源有：事件回调句柄、动画效果等，再根据优先级并发处理，提升渲染性能
    + setState设计为异步，可以显著的提升性能

### setState同步更新还是异步更新？
- React17稳定版本或者React17以前的版本中，即legacy模式下，在react能够接管的地方，比如生命周期或者合成事件中，setState是异步更新的。
但是在setTimeout或者通过window.addEventListener添加的原生事件中，setState则是同步的。
```jsx
// Legacy同步模式
const container = document.getElementById('root');
ReactDOM.render(<App />, container);
```
- 在React开发版本中，即concurrent模式下，setState的更新统一是异步的
```jsx
// Concurrent异步模式，在这个模式下，任何情况下setState都是异步更新的。目前createRoot方法还在实验中
const container = document.getElementById('root');
// ReactDOM.render(<App />, container);
ReactDOM.createRoot(container).render(<App />)
```
#### setState更新demo
以下面的代码为例，以下示例均在react@17.0.1，react-dom@17.0.1版本的legacy模式下实现
```jsx
import React from 'react';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      number: 0
    }
  }

  handleClick = event => {
    // todo
  }

  render(){
    console.log('render...', this.state)
    return (
      <div>
        计数器：{this.state.number}
        <div>
          <button onClick={this.handleClick}>add</button>
        </div>
      </div>
    )
  }
}
export default App;
```

##### demo1
```jsx
handleClick = event => {
    this.setState({ number: this.state.number + 1 }, () => {
      console.log('setState1 callback', this.state)
    })
    console.log('after setState1', this.state) // number: 0
    this.setState({ number: this.state.number + 1 }, () => {
      console.log('setState2 callback', this.state)
    })
    console.log('after setState2', this.state)  // number: 0
}
```
点击按钮，打印顺序：               
after setState1 {number: 0}        
after setState2 {number: 0}        
render... {number: 1}        
setState1 callback {number: 1}        
setState2 callback {number: 1}              

可以得出以下结论：
- 状态是异步更新的
- setState的回调函数是在状态更新后批量执行的

##### demo2 setTimeout中同步更新
```jsx
handleClick = event => {
    setTimeout(() => {
      this.setState({ number: this.state.number + 1 }, () => {
        console.log('setState1 callback', this.state)
      })
      console.log('after setState1', this.state) // number: 0
      this.setState({ number: this.state.number + 1 }, () => {
        console.log('setState2 callback', this.state)
      })
      console.log('after setState2', this.state)  // number: 0
    }, 4)
}
```
打印顺序：        
render... {number: 1}        
setState1 callback {number: 1}        
after setState1 {number: 1}        
render... {number: 2}        
setState2 callback {number: 2}        
after setState2 {number: 2}        


可以得出以下结论
- 状态是同步更新的，因此setState的回调也是同步执行的

***注意观察render的打印时机以及次数！！！！***

###### demo3 setState接收一个函数
```jsx
handleClick = event => {
    this.setState((prevState) => {
      console.log('setState1...', prevState)
      return { number: prevState.number + 1 }
    }, () => {
      console.log('setState1 callback', this.state)
    })

    console.log('after setState1', this.state) 

    this.setState((prevState) => {
      console.log('setState2...', prevState)
      return { number: prevState.number + 1 }
    }, () => {
      console.log('setState2 callback', this.state)
    }) 
    console.log('after setState2', this.state) 
}
```
打印顺序：        
after setState1 {number: 0}          
after setState2 {number: 0}          
setState1... {number: 0}          
setState2... {number: 1}          
render... {number: 2}          
setState1 callback {number: 2}           
setState2 callback {number: 2}          

结论：
- 状态是异步更新的
- 可以发现在批量输出`setState1...`  `setState2...` 后，即刻打印`render...`，最后打印 `setState1 callback` 以及 `setState2 callback`，这也正是说明setState的回调函数是在render更新之后执行的

###### demo4 settimeout中setState接收函数的情况
```jsx
handleClick = event => {
    setTimeout(() => {
        this.setState((prevState) => {
        console.log('setState1...', prevState)
        return { number: prevState.number + 1 }
        }, () => {
        console.log('setState1 callback', this.state)
        })

        console.log('after setState1', this.state) 

        this.setState((prevState) => {
        console.log('setState2...', prevState)
        return { number: prevState.number + 1 }
        }, () => {
        console.log('setState2 callback', this.state)
        })
        
        console.log('after setState2', this.state) 
    }, 4);
}
```
打印顺序：               
setState1... {number: 0}          
render... {number: 1}          
setState1 callback {number: 1}          
after setState1 {number: 1}          
setState2... {number: 1}          
render... {number: 2}          
setState2 callback {number: 2}          
after setState2 {number: 2}          

结论
- 状态是同步更新的
- ***一定要仔细品味setState、render、 setState callback、after setState打印顺序之间的关系!!!!***


###### demo5 ReactDOM.unstable_batchedUpdates强制异步更新状态
```jsx
handleClick = event => {
    setTimeout(() => {
        ReactDOM.unstable_batchedUpdates(() => {
            this.setState((prevState) => {
                console.log('setState1...', prevState)
                return { number: prevState.number + 1 }
            }, () => {
                console.log('setState1 callback', this.state)
            })

            console.log('after setState1', this.state) 

            this.setState((prevState) => {
                console.log('setState2...', prevState)
                return { number: prevState.number + 1 }
            }, () => {
                console.log('setState2 callback', this.state)
            })

            console.log('after setState2', this.state) 
        })
    }, 4);
}
```
打印顺序：          
after setState1 {number: 0}          
after setState2 {number: 0}          
setState1... {number: 0}          
setState2... {number: 1}          
render... {number: 2}          
setState1 callback {number: 2}          
setState2 callback {number: 2}          


结论：
- 在同步模式(legacy)下，如果需要在setTimeout等中启用异步更新，可以使用React17新增的`ReactDOM.unstable_batchedUpdates`API




### setState执行过程
- this.setState
- React.Component