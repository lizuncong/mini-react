import React, { useContext } from "react";
import ReactDOM from "react-dom";

const CounterContext = React.createContext(-1);
const UserContext = React.createContext("mike");

const Counter = () => {
  const context = useContext(CounterContext);

  return <div>{context}</div>;
};

class App extends React.Component {
  constructor(props) {
    super(props);
  }
  shouldComponentUpdate() {
    return false;
  }
  render() {
    console.log("App render，控制台只会输出一次");
    return <Counter />;
  }
}
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 1,
    };
  }

  render() {
    return [
      <CounterContext.Provider value={this.state.count}>
        <UserContext.Provider value={this.state.count + "mike"}>
          <App />
        </UserContext.Provider>
      </CounterContext.Provider>,
      <button
        onClick={() => {
          this.setState({
            count: this.state.count + 1,
          });
        }}
      >
        click
      </button>,
    ];
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
