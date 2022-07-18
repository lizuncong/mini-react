import React from "react";
import ReactDOM from "react-dom";
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
        <div id="A">
          {count}
          <div id="A2">A2</div>
        </div>
        <p id="B">
          <span id="B1">B1</span>
        </p>
      </div>
    );
  }
}

ReactDOM.hydrate(<Home />, document.getElementById("root"));
