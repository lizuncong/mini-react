import React, {
  useContext,
  useRef,
  useState,
  useImperativeHandle,
  memo,
} from "react";
import ReactDOM from "react-dom";

const FunctionCounter = (props) => {
  const [count, setCount] = useState(0);
  console.log("props..", props);
  return <div ref={props.myRef}>{`计数器：${count}-${props.name}`}</div>;
};

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.domRef = React.createRef();
  }
  componentDidMount() {
    console.log("dom节点ref：this.domRef", this.domRef);
  }

  render() {
    return <FunctionCounter myRef={this.domRef} name="test" />;
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
