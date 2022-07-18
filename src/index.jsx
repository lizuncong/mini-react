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
        <p id="A">
          {count}
          <div id="A2">A2</div>
        </p>
        <p id="B">
          <div id="B1">B1</div>
        </p>
      </div>
    );
  }
}

ReactDOM.hydrate(<Home />, document.getElementById("root"));
