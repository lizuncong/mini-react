import React from "react";
import ReactDOM from "react-dom";
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 1,
    };
  }

  render() {
    const { count } = this.state;
    return <div id="client">客户端的文本</div>;
  }
}

ReactDOM.hydrate(<Home />, document.getElementById("root"));
