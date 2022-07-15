import React from "react";
import ReactDOM from "react-dom";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: 1
    }
  }

  render() {
    const text = '<img src="x" onerror="alert(1)">';
    const text2 = {
      $$typeof: Symbol.for('react.element'),
      props: {
        dangerouslySetInnerHTML: {
          __html: '<img src="x" onerror="alert(1)">'
        },
      },    
      ref: null,
      type: "div",
    }
    const { count } = this.state
    return (
      <div>
      {text2}
    </div>
    );
  }
}

ReactDOM.render(<Home />, document.getElementById("root"));
