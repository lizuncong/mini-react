import React, { useContext, memo } from "react";
import ReactDOM from "react-dom";

class Counter extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div>Class Counter</div>;
  }
}
const FunctionCounter = () => {
  return <div>函数组件Counter</div>;
};

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.domRef = React.createRef();
  }
  componentDidMount() {
    console.log("did mount....this.myRef", this.myRef);
    console.log("did mount....this.domRef", this.domRef);
  }

  render() {
    return (
      <div ref={this.domRef}>
        <Counter ref={this.myRef} />
        <FunctionCounter />
      </div>
    );
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
