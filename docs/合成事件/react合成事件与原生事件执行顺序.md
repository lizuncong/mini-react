#### React合成事件
React17版本开始，对事件系统的两个重要变更：
- React17以前将事件(包括捕获及冒泡)委托到document的冒泡阶段触发。React17开始将冒泡事件委托到容器root的冒泡阶段触发，将捕获事件委托到容器root的捕获阶段触发
- [移除事件池](https://zh-hans.reactjs.org/blog/2020/08/10/react-v17-rc.html#no-event-pooling)

#### 合成事件的基础
- 合成事件的执行时机。
    + React17以前，**由于合成事件委托在document的冒泡事件上**，因此合成事件在document的冒泡阶段执行。 先执行document原生捕获事件，然后是原生的捕获事件，原生的冒泡事件，react捕获事件，react冒泡事件，document原生冒泡事件
    + React17及以后，合成事件捕获以及合成事件冒泡分别委托在root容器的捕获事件以及冒泡事件上。
- 目的和优势
    + 进行浏览器兼容，React采用的是顶层事件代理机制，能够保证冒泡一致性
    + 事件对象可能会被频繁创建和回收，因此React引入事件池，在事件池中获取或释放事件对象(React17后被废弃)

    
#### React17以前
合成事件委托绑定到document上，在document的冒泡阶段执行。以react@16.14.0，react-dom@16.14.0为例，观察控制台输出可以看出，先打印所有的原生事件，其次在document的冒泡阶段才执行完所有的捕获以及冒泡事件
- 示例
```jsx
import React from 'react';

class App extends React.Component {
  parentRef = React.createRef();
  childRef = React.createRef();
  constructor(props){
      super(props)
    //   document.addEventListener('click', () => {
    //     console.log('document捕获')
    //   }, true)
    //   document.addEventListener('click', () => {
    //     console.log('document冒泡')
    //   })
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
export default App;
// 打印顺序：
// document捕获
// 父元素原生捕获
// 子元素原生捕获
// 子元素原生冒泡
// 父元素原生冒泡
// 父元素React事件捕获
// 子元素React事件捕获
// 子元素React事件冒泡
// 父元素React事件冒泡
// document冒泡    // 有意思的是document冒泡是最后执行的
```

#### 模拟React17以前合成事件实现
合成事件绑定在document的冒泡阶段。点击目标元素时，在document的冒泡阶段获取目标元素上所有的父元素及祖先元素。然后执行这些元素的捕获及冒泡事件
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>React16 Event</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <div id="parent">
    <p id="child">事件执行</p>
  </div>
  <script>
    function dispatchEvent(event){
      const paths = [];
      let current = event.target;
      while(current){
        paths.push(current)
        current = current.parentNode
      }
      // 模拟捕获和冒泡，其实在这个时候，原生的捕获阶段已经结束了
      // 捕获阶段
      for(let i = paths.length-1; i >= 0; i--){
        const handler = paths[i].onClickCapture;
        handler && handler()
      }
      // 冒泡阶段
      for(let i = 0; i < paths.length; i++){
        const handler = paths[i].onClick;
        handler && handler()
      }
    }
    // 注册React事件的事件委托
    document.addEventListener('click', dispatchEvent)


    const parent = document.getElementById('parent')
    const child = document.getElementById('child')
    parent.addEventListener('click', () => {
      console.log('父元素原生捕获')
    }, true)
    parent.addEventListener('click', () => {
      console.log('父元素原生冒泡')
    })
    child.addEventListener('click', () => {
      console.log('子元素原生捕获')
    }, true)
    child.addEventListener('click', () => {
      console.log('子元素原生冒泡')
    })
    document.addEventListener('click', () => {
      console.log('document捕获')
    }, true)
    document.addEventListener('click', () => {
      console.log('document冒泡')
    })
    parent.onClick = () => {
      console.log('父元素React事件冒泡')
    }
    child.onClick = () => {
      console.log('子元素React事件冒泡')
    }
    parent.onClickCapture = () => {
      console.log('父元素React事件捕获')
    }
    child.onClickCapture = () => {
      console.log('子元素React事件捕获')
    }
  </script>
</body>
</html>
```



#### React17及以后
事件委托不再绑定到document上，而是绑定到react挂载的容器上，即render方法挂载的容器root。在root的捕获阶段执行react的合成的捕获事件，在root的冒泡阶段执行react的合成的冒泡事件。以react@17.0.1，react-dom@17.0.1为例

```jsx
import React from 'react';

class App extends React.Component {
  parentRef = React.createRef();
  childRef = React.createRef();
  constructor(props){
      super(props)
    //   document.addEventListener('click', () => {
    //     console.log('document捕获')
    //   }, true)
    //   document.addEventListener('click', () => {
    //     console.log('document冒泡')
    //   })
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
export default App;
// 打印顺序：
// document捕获
// 父元素React事件捕获
// 子元素React事件捕获
// 父元素原生捕获
// 子元素原生捕获
// 子元素原生冒泡
// 父元素原生冒泡
// 子元素React事件冒泡
// 父元素React事件冒泡
// document冒泡
```

#### 模拟React17合成事件实现
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>React16 Event</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <div id="root">
    <div id="parent">
      <p id="child">事件执行</p>
    </div>
  </div>
  <script>
    function dispatchEvent(event, useCapture){
      const paths = [];
      let current = event.target;
      while(current){
        paths.push(current)
        current = current.parentNode
      }
      // 模拟捕获和冒泡，其实在这个时候，原生的捕获阶段已经结束了
      if(useCapture){
        // 捕获阶段
        for(let i = paths.length-1; i >= 0; i--){
          const handler = paths[i].onClickCapture;
          handler && handler()
        }
      } else {
        // 冒泡阶段
        for(let i = 0; i < paths.length; i++){
          const handler = paths[i].onClick;
          handler && handler()
        }
      }
    }


    const root = document.getElementById('root')
    const parent = document.getElementById('parent')
    const child = document.getElementById('child')


    // 注册React事件的事件委托
    root.addEventListener('click', event => dispatchEvent(event, true), true) // 捕获阶段监听
    root.addEventListener('click', dispatchEvent) // 冒泡阶段监听


    parent.addEventListener('click', () => {
      console.log('父元素原生捕获')
    }, true)
    parent.addEventListener('click', () => {
      console.log('父元素原生冒泡')
    })
    child.addEventListener('click', () => {
      console.log('子元素原生捕获')
    }, true)
    child.addEventListener('click', () => {
      console.log('子元素原生冒泡')
    })
    root.addEventListener('click', () => {
      console.log('root原生事件捕获')
    }, true)
    root.addEventListener('click', () => {
      console.log('root原生事件冒泡')
    })
    parent.onClick = () => {
      console.log('父元素React事件冒泡')
    }
    child.onClick = () => {
      console.log('子元素React事件冒泡')
    }
    parent.onClickCapture = () => {
      console.log('父元素React事件捕获')
    }
    child.onClickCapture = () => {
      console.log('子元素React事件捕获')
    }
  </script>
</body>
</html>
```


#### stopPropagation以及stopImmediatePropagation
- event.stopPropagation阻止向上冒泡，但是本元素其余的监听函数还是会执行
```js
document.addEventListener('click', e => {
    e.stopPropagation() // 不再向上冒泡，但还是会打印2
    console.log(1)
})
document.addEventListener('click', e => {
    console.log(2)
})
```
- event.stopImmediatePropagation阻止向上冒泡，同时本元素其余的监听函数不会执行
```js
document.addEventListener('click', e => {
    e.stopImmediatePropagation() // 不再向上冒泡，同时2不会打印
    console.log(1)
})
document.addEventListener('click', e => {
    console.log(2)
})
```

- 在react17版本以前，以react@16，react-dom@16版本为例
```jsx
import React from 'react';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      show: false
    }
  }
  componentDidMount(){
    document.addEventListener('click', () => {
      console.log('handleDocumentClick')
      this.setState({
        show: false
      })
    })
  }

  handleButtonClick = e => {
    console.log('handleButtonClick')
    // e.stopPropagation() //没作用
    e.nativeEvent.stopImmediatePropagation(); // 只有这样才会阻止document上的事件执行
    this.setState({
      show: true
    })
  }

  render(){
    return (
      <div>
        <button onClick={this.handleButtonClick}>显示</button>
        {
          this.state.show && (
            <div>
              模态框
            </div>
          )
        }
      </div>
    )
  }
}
export default App;
```