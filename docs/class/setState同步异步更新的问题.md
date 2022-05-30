### setState

由于 React 没有实现 类似于 Vue 的依赖收集来监听数据的变化，因此我们不能直接通过 `this.state.count = 2` 修改 state 的值来更新界面。我们必须手动调用 `this.setState` 触发更新过程

### setState 同步更新还是异步更新？

- React17 稳定版本或者 React17 以前的版本中，即 legacy 模式下，在 react 能够接管的地方，比如生命周期或者合成事件中，setState 是异步更新的。
  但是在 setTimeout 或者通过 window.addEventListener 添加的原生事件中，setState 则是同步的。

```jsx
// Legacy同步模式
const container = document.getElementById("root");
ReactDOM.render(<App />, container);
```

- 在 React 开发版本中，即 concurrent 模式下，setState 的更新统一是异步的

```jsx
// Concurrent异步模式，在这个模式下，任何情况下setState都是异步更新的。目前createRoot方法还在实验中
const container = document.getElementById("root");
// ReactDOM.render(<App />, container);
ReactDOM.createRoot(container).render(<App />);
```

#### setState 更新 demo

以下面的代码为例，以下示例均在react@17.0.1，react-dom@17.0.1版本的 legacy 模式下实现

```jsx
import React from "react";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      number: 0,
    };
  }

  handleClick = (event) => {
    // todo
  };

  render() {
    console.log("render...", this.state);
    return (
      <div>
        计数器：{this.state.number}
        <div>
          <button onClick={this.handleClick}>add</button>
        </div>
      </div>
    );
  }
}
export default App;
```

##### demo1

```jsx
handleClick = (event) => {
  this.setState({ number: this.state.number + 1 }, () => {
    console.log("setState1 callback", this.state);
  });
  console.log("after setState1", this.state); // number: 0
  this.setState({ number: this.state.number + 1 }, () => {
    console.log("setState2 callback", this.state);
  });
  console.log("after setState2", this.state); // number: 0
};
```

点击按钮，打印顺序：  
after setState1 {number: 0}  
after setState2 {number: 0}  
render... {number: 1}  
setState1 callback {number: 1}  
setState2 callback {number: 1}

可以得出以下结论：

- 状态是异步更新的
- setState 的回调函数是在状态更新后批量执行的

##### demo2 setTimeout 中同步更新

```jsx
handleClick = (event) => {
  setTimeout(() => {
    this.setState({ number: this.state.number + 1 }, () => {
      console.log("setState1 callback", this.state);
    });
    console.log("after setState1", this.state); // number: 0
    this.setState({ number: this.state.number + 1 }, () => {
      console.log("setState2 callback", this.state);
    });
    console.log("after setState2", this.state); // number: 0
  }, 4);
};
```

打印顺序：  
render... {number: 1}  
setState1 callback {number: 1}  
after setState1 {number: 1}  
render... {number: 2}  
setState2 callback {number: 2}  
after setState2 {number: 2}

可以得出以下结论

- 状态是同步更新的，因此 setState 的回调也是同步执行的

**_注意观察 render 的打印时机以及次数！！！！_**

###### demo3 setState 接收一个函数

```jsx
handleClick = (event) => {
  this.setState(
    (prevState) => {
      console.log("setState1...", prevState);
      return { number: prevState.number + 1 };
    },
    () => {
      console.log("setState1 callback", this.state);
    }
  );

  console.log("after setState1", this.state);

  this.setState(
    (prevState) => {
      console.log("setState2...", prevState);
      return { number: prevState.number + 1 };
    },
    () => {
      console.log("setState2 callback", this.state);
    }
  );
  console.log("after setState2", this.state);
};
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
- 可以发现在批量输出`setState1...` `setState2...` 后，即刻打印`render...`，最后打印 `setState1 callback` 以及 `setState2 callback`，这也正是说明 setState 的回调函数是在 render 更新之后执行的

###### demo4 settimeout 中 setState 接收函数的情况

```jsx
handleClick = (event) => {
  setTimeout(() => {
    this.setState(
      (prevState) => {
        console.log("setState1...", prevState);
        return { number: prevState.number + 1 };
      },
      () => {
        console.log("setState1 callback", this.state);
      }
    );

    console.log("after setState1", this.state);

    this.setState(
      (prevState) => {
        console.log("setState2...", prevState);
        return { number: prevState.number + 1 };
      },
      () => {
        console.log("setState2 callback", this.state);
      }
    );

    console.log("after setState2", this.state);
  }, 4);
};
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
- **_一定要仔细品味 setState、render、 setState callback、after setState 打印顺序之间的关系!!!!_**

###### demo5 ReactDOM.unstable_batchedUpdates 强制异步更新状态

```jsx
handleClick = (event) => {
  setTimeout(() => {
    ReactDOM.unstable_batchedUpdates(() => {
      this.setState(
        (prevState) => {
          console.log("setState1...", prevState);
          return { number: prevState.number + 1 };
        },
        () => {
          console.log("setState1 callback", this.state);
        }
      );

      console.log("after setState1", this.state);

      this.setState(
        (prevState) => {
          console.log("setState2...", prevState);
          return { number: prevState.number + 1 };
        },
        () => {
          console.log("setState2 callback", this.state);
        }
      );

      console.log("after setState2", this.state);
    });
  }, 4);
};
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

- 在同步模式(legacy)下，如果需要在 setTimeout 等中启用异步更新，可以使用 React17 新增的`ReactDOM.unstable_batchedUpdates`API
