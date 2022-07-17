import React from "react";
import ReactDOM from "react-dom";
import Counter from "./count";
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 1,
    };
  }

  render() {
    const { count } = this.state;
    return (
      <div id="container">
        <div id="text">hello world</div>
        <Counter />
      </div>
    );
  }
}

ReactDOM.hydrate(<Home />, document.getElementById("root"));
