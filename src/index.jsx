import React, { useContext } from "react";
import ReactDOM from "react-dom";

const CounterContext = React.createContext(-1);

const Counter = () => {
  console.log("Function Counter render");
  const context = useContext(CounterContext);
  return <div>{context}</div>;
};

class ClassCounter extends React.Component {
  static contextType = CounterContext;
  render() {
    console.log("Class Counter render");
    return (
      <div>
        {this.context}
      </div>
    );
  }
}
class Home extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return [
      <CounterContext.Provider id="provider1" value={1}>
        <Counter id="counter1" />
        <ClassCounter />
      </CounterContext.Provider>,
    ];
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
