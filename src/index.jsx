import React from "react";
import ReactDOM from "react-dom";
import Counter from "./counter";
import ErrorBoundary from "./error";
import Product from "./Product";
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
    };
  }
  // componentDidMount() {
  //   console.log("did mount", add);
  // }
  render() {
    return (
      <ErrorBoundary>
        <Counter />
      </ErrorBoundary>
    );
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
