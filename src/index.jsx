import React, { useContext, memo } from "react";
import ReactDOM from "react-dom";

const CounterContext = React.createContext(-1);
const UserContext = React.createContext("mike");

const Counter = () => {
  const context = useContext(CounterContext);
  console.log('Counter..render')
  return <div>{context}</div>;
};
const CounterWrap = () => {
  console.log('CounterWrap..render')
  return (
    <Counter />
  )
}
class App extends React.Component {
  constructor(props) {
    super(props);
  }
  shouldComponentUpdate() {
    return false;
  }
  componentDidUpdate(){
    console.log('componentDidUpdate')
  }
  render() {
    console.log("App render，控制台只会输出一次");
    return <CounterWrap />;
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
        <App />
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
