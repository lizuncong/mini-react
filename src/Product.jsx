import React from "react";
import ReactDOM from "react-dom";

class Product extends React.Component {
  constructor(props) {
    super(props);
  }
  componentDidUpdate() {
    console.log("componentDidUpdate...", dd);
  }
  render() {
    return <div>Product</div>;
  }
}

export default Product;
