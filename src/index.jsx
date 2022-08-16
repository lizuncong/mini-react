import React, { useContext } from "react";
import ReactDOM from "react-dom";

const CounterContext = React.createContext({
  count: 0,
  addCount: () => {},
});

const Counter = () => {
  const context = useContext(CounterContext);
  console.log("Counter render");
  return (
    <button id="counter" onClick={context.addCount}>
      {context.count}
    </button>
  );
};
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.addCount = () => {
      console.log("点击按钮触发更新", this.state.count + 1);
      this.setState({
        count: this.state.count + 1,
      });
    };
    this.state = {
      count: 0,
      addCount: this.addCount,
    };

    this.primaryState = {
      count: 100,
      addCount: this.addCount,
    }
  }

  render() {
    console.log("Home render");
    return (
      <CounterContext.Provider value={this.state}>
        <Counter />
        <CounterContext.Provider value={this.primaryState}>
          <Counter />
        </CounterContext.Provider>
      </CounterContext.Provider>
    );
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
