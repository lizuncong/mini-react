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
      <ul style={{ marginTop: '100px' }} key="ul" onClick={this.handleClick}>
        <li key="A" id="A">A</li>
        <li key="B" id="B">B</li>
        <li key="C" id="C">C</li>
        <li key="D" id="D">D</li>
        <li key="E" id="E">E</li>
        <li key="F" id="F">F</li>
      </ul>
    ) : (
      <ul style={{ marginTop: '100px' }} key="ul" onClick={this.handleClick}>
        <li key="A" id="A2">A2</li>
        <li key="B2" id="B2">B2</li>
        <li key="D" id="D2">D2</li>
        <li key="H" id="H">H</li>
        <li key="C" id="C2">C2</li>
        <li key="F" id="F2">F2</li>
        <li key="G" id="G2">G2</li>
      </ul>
    );
  }
}

ReactDOM.render(<Home />, document.getElementById("root"));
