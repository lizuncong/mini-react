import React, {
  useContext,
  useRef,
  useState,
  useImperativeHandle,
  memo,
} from "react";
import ReactDOM from "react-dom";

const FunctionCounter = (props, ref) => {
  const createInst = () => ({
    focus: () => {
      console.log("focus...");
    },
  });
  useImperativeHandle(ref, createInst);
  return <div>{`计数器：${props.count}`}</div>;
};

const ForwardRefCounter = React.forwardRef(FunctionCounter);

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.domRef = null; // React.createRef
    this.state = {
      count: 0,
    };
  }
  componentDidMount() {
    console.log("dom节点ref：this.domRef", this.domRef);
  }

  render() {
    return (
      <>
        <ForwardRefCounter
          ref={(el) => (this.domRef = el)}
          count={this.state.count}
        />
        <button onClick={() => this.setState({ count: this.state.count + 1 })}>
          {this.state.count}
        </button>
      </>
    );
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
