import React from "react";
import ReactDOM from "react-dom";
import Counter from "./counter";
import ErrorBoundary from './error'

class Home extends React.Component{
  constructor(props) {
    super(props);
  }

  render(){
    return  <div><Counter /></div>
  }
}
ReactDOM.render(<Home />, document.getElementById("root"));
