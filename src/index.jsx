import React, { useContext } from "react";
import ReactDOM from "react-dom";

const ThemeContext = React.createContext("light");

class ThemedButton extends React.Component {
  static contextType = ThemeContext;
  render() {
    return <button id="button类组件">{this.context}</button>;
  }
}

function ThemeFooter() {
  return (
    <div id="footer">
      <ThemeContext.Consumer>{(value) => value}</ThemeContext.Consumer>
    </div>
  );
}

function ThemeHeader() {
  const value = useContext(ThemeContext);

  return <div id="header函数组件">{value}</div>;
}

function Toolbar() {
  return (
    <div>
      <ThemeHeader />
      <ThemedButton />
      <ThemeFooter />
    </div>
  );
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 0,
    };
  }

  render() {
    return (
      <div onClick={() => this.setState({ count: this.state.count + 1 })}>
        <ThemeContext.Provider value={`dark${this.state.count}`}>
          <Toolbar />
        </ThemeContext.Provider>
      </div>
    );
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
