import React from "react";
import ReactDOM from "react-dom";

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = { step: 0 };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState({
      step: this.state.step + 1,
    });
  }
  render() {
    const { step } = this.state;
    return (
      <div id={step} onClick={this.handleClick}>
        <span>{step}</span>
        <p>{-step}</p>
      </div>
    );
  }
}

ReactDOM.render(<Index />, document.getElementById("root"));
