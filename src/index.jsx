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
  }
  componentDidMount() {
    console.log("dom节点ref：this.domRef", this.domRef);
  }

  render() {
    return <div ref={this.domRef}>dom ref</div>;
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
