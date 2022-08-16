import React, { useContext } from "react";
import ReactDOM from "react-dom";

const CounterContext = React.createContext(-1);

const Counter = () => {
  const context = useContext(CounterContext);
  return <div>{context}</div>;
};
class Home extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return [
      <CounterContext.Provider value={1}>
        <Counter />
      </CounterContext.Provider>,
      <Counter />,
    ];
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
