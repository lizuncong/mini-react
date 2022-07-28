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
  componentDidUpdate() {
    console.log("didmount...", ad);
  }
  render() {
    return (
      <div onClick={() => this.setState({ count: this.state.count + 1 })}>
        <Counter />
        <Product count={this.state.count} />
      </div>
    );
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
