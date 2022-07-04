import React from "react";
import ReactDOM from "react-dom";

class Home extends React.Component {
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
        {step}
      </div>
    );
  }
}

ReactDOM.render(<Home />, document.getElementById("root"));
