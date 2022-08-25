import React from "react";
import ReactDOM from "react-dom";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
    };
  }

  render() {
    return (
      <input
        type="text"
        value={this.state.text}
        onChange={(e) => this.setState({ text: e.target.value })}
      />
    );
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
