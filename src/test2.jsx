import React, { useContext } from "react";
import ReactDOM from "react-dom";

const CounterContext = React.createContext({
  count: 0,
  addCount: () => {
    console.log("默认的点击事件");
  },
});

const UserContext = React.createContext("mike");

const Counter = () => {
  const context = useContext(CounterContext);
  const user = useContext(UserContext);
  console.log("Counter render", user);
  return (
    <div id="counter" onClick={context.addCount}>
      {`${user}-${context.count}`}
    </div>
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
    };
  }

  render() {
    console.log("Home render");
    return [
      <CounterContext.Provider id="counterProvider1" value={this.state}>
        <CounterContext.Provider
          id="counterProvider2"
          value={this.primaryState}
        >
          <UserContext.Provider
            id="userProvider1"
            value={`mike-${this.state.count}`}
          >
            <Counter id="counter1" />
          </UserContext.Provider>
        </CounterContext.Provider>
        <Counter id="counter2" />
      </CounterContext.Provider>,
      <Counter id="counter3" />,
    ];
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
