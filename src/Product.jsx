import React from "react";
import ReactDOM from "react-dom";

class Product extends React.Component {
  constructor(props) {
    super(props);
    throw Promise.resolve(1);
    // console.log("构造函数...", a);
  }
  componentDidUpdate() {
    // console.log("componentDidUpdate...", dd);
  }
  render() {
    return <div>Product{}</div>;
  }
}

export default Product;
