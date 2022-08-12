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
        {this.context.count}
      </button>
    );
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
    return <Counter />;
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
    return <div id="user">{this.context.name}</div>;
  }
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
      <UserContext.Provider value={{ name: `john-${this.state.count}` }}>
        <User />
        <CounterContext.Provider value={this.state}>
          <App />
        </CounterContext.Provider>
      </UserContext.Provider>
    );
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
