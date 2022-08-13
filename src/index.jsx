import React, { useContext } from "react";
import ReactDOM from "react-dom";

const CounterContext = React.createContext({
  count: 0,
  addCount: () => {},
});

class Counter extends React.Component {
  static contextType = CounterContext;
  render() {
    console.log("Counter...render", this.context);
    return (
      <button id="counter" onClick={this.context.addCount}>
        contextType：{this.context.count}
      </button>
    );
  }
}

const FunctionCounter = () => {
  const context = useContext(CounterContext);
  return <div id="函数组件">函数组件：{context.count}</div>;
};

const ConsumerFunction = (context) => {
  return <div>Context.consumer：{context.count}</div>;
};
function ConsumerCounter() {
  return <CounterContext.Consumer>{ConsumerFunction}</CounterContext.Consumer>;
}
class CounterWrap extends React.Component {
  render() {
    return [<div>CounterWrap</div>, <Counter />];
  }
}

class Test extends React.Component {
  render() {
    return <div>APP第三个子元素，类组件TEST</div>;
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
  }
  shouldComponentUpdate() {
    return false;
  }
  render() {
    return [
      <CounterWrap />,
      <div>App第2个子元素，HostComponent</div>,
      <Test />,
    ];
  }
}
const UserContext = React.createContext({
  name: "mike",
});
class User extends React.Component {
  static contextType = UserContext;
  constructor(props) {
    super(props);
  }
  shouldComponentUpdate() {
    return false;
  }
  render() {
    console.log("user render....", this.context);
    return <div id="user">{this.context}</div>;
  }
}
const RouterContext = React.createContext("default history router");
class Route extends React.Component {
  static contextType = RouterContext;
  constructor(props) {
    super(props);
  }
  render() {
    return <div>{this.context}</div>;
  }
}
function ProfilePage(name, count) {
  return (
    <div>
      消费多个context：{name}：{count}
    </div>
  );
}
function ConsumerMutil() {
  return (
    <UserContext.Consumer>
      {(name) => (
        <CounterContext.Consumer>
          {(context) => <ProfilePage name={name} count={context.count} />}
        </CounterContext.Consumer>
      )}
    </UserContext.Consumer>
  );
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.addCount = () => {
      this.setState({
        count: this.state.count + 1,
      });
    };
    this.state = {
      count: 0,
      addCount: this.addCount,
    };
  }

  render() {
    return (
      <UserContext.Provider
        value={
          this.state.count && !(this.state.count % 2)
            ? `john-${this.state.count}`
            : "john"
        }
      >
        <User />
        <Route />
        <CounterContext.Provider value={this.state}>
          <FunctionCounter />
          <ConsumerCounter />
          <ConsumerMutil />
          <App />
        </CounterContext.Provider>
      </UserContext.Provider>
    );
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
