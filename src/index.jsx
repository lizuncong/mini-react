import React from "react";
import ReactDOM from "react-dom";
import NumberComp from "./Number";

const arr = [];
for (let i = 0; i < 10; i++) {
  arr.push(i);
}
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "默认值",
    };
  }

  render() {
    return (
      <>
        <input
          type="text"
          value={this.state.text}
          onChange={(e) => this.setState({ text: e.target.value })}
        />
        {arr.map((_, i) => (
          <NumberComp count={i} />
        ))}
      </>
    );
  }
}
// ReactDOM.unstable_createRoot(document.getElementById("root")).render(<Home />);
ReactDOM.render(<Home />, document.getElementById("root"));
