import React, { useContext, useRef, useState, memo } from "react";
import ReactDOM from "react-dom";

class ClassCounter extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return <div>Class Counter</div>;
  }
}
const FunctionCounter = () => {
  debugger;
  const domRef = useRef(null);
  return <div ref={domRef}>函数组件Counter</div>;
};

const ForwardRefCounter = React.forwardRef((props, ref) => {
  const [count, setCount] = useState(0);
  return <div ref={ref}>{`函数组件${count}${props.name}`}</div>;
});

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.classRef = React.createRef();
    this.domRef = React.createRef();
    this.functionRef = React.createRef();
    this.forRef = React.createRef();
    this.callbackRef = null;
  }
  componentDidMount() {
    console.log("类组件ref：this.classRef", this.classRef);
    console.log("dom节点ref：this.domRef", this.domRef);
    console.log("函数组件ref：this.functionRef", this.functionRef);
    console.log("回调ref：this.callbackRef", this.callbackRef);
    console.log("回调ref：this.forRef", this.forRef);
  }

  render() {
    return (
      <div ref={this.domRef}>
        <div ref={(el) => (this.callbackRef = el)}>回调ref</div>
        <ClassCounter ref={this.classRef} />
        <FunctionCounter ref={this.functionRef} />
        <ForwardRefCounter ref={this.forRef} name="lzc" />
      </div>
    );
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
