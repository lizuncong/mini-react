import React, {
  useContext,
  useRef,
  useState,
  useImperativeHandle,
  memo,
} from "react";
import ReactDOM from "react-dom";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.domRef = React.createRef();
    this.state = {
      count: 0,
    };
  }
  componentDidMount() {
    console.log("dom节点ref：this.domRef", this.domRef);
  }

  render() {
    const { count } = this.state;
    return (
      <div
        ref={this.domRef}
        id="counter"
        name="test"
        onClick={() => this.setState({ count: this.state.count + 1 })}
      >
        {`dom ref：${count}`}
      </div>
    );
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
