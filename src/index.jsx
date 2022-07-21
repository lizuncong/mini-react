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
      <div id={count + 1}>
        <div
          onClick={() => {
            debugger
            this.setState({ count: count + 1 }, () => {
              console.log("类组件set state回调");
            });
          }}
        >
          hello world
        </div>
        <Counter />
      </div>
    );
  }
}

ReactDOM.render(<Home />, document.getElementById("root"), () => {
  console.log("render 回调....");
});
