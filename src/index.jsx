import React from "react";
import ReactDOM from "react-dom";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState({
      count: this.state.count + 1,
    });
  }
  render() {
    const { count } = this.state;
    return !count ? (
      [<span>1</span>, <h1 onClick={this.handleClick}>{count}</h1>, <h3>2</h3>]
    ) : (
      <h1 onClick={this.handleClick}>{count}</h1>
    );
  }
}

ReactDOM.render(<Home />, document.getElementById("root"));
