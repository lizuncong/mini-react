import React from "react";
import ReactDOM from "react-dom";
import NumberComp from "./Number";

const arr = [];
for (let i = 0; i < 1000; i++) {
  arr.push(i);
}
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "默认值",
      count: 0,
    };
  }

  render() {
    return (
      <>
        <div
          onClick={() => this.setState({ count: this.state.count + 1 })}
          className="animation"
        >{`count：${this.state.count}`}</div>
        {arr.map((i) => (
          <NumberComp key={i} count={i} />
        ))}
      </>
    );
  }
}

// ReactDOM.createRoot(document.getElementById("root")).render(<Home />);

ReactDOM.unstable_createRoot(document.getElementById("root")).render(<Home />);
// ReactDOM.render(<Home />, document.getElementById("root"));
