import React from "react";
import ReactDOM from "react-dom";

// import React from "@react";
// import ReactDOM from "@react-dom";

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
      <div style={{ height: "100px" }} id={"A" + step} onClick={this.handleClick}>
        <div id={"B" + step}></div>
        {!(step % 2) && <div id="C"></div>}
        <div id={"D" + step}></div>
      </div>
    );
  }
  // render() {
  //   const { step } = this.state;
  //   return (
  //     <div
  //       style={{ height: "100px" }}
  //       id={"A-" + step}
  //       onClick={this.handleClick}
  //     >
  //       <div id={"B-" + step}>
  //         <div id={"D"}>
  //           <div id={"F-" + step}></div>
  //           {!(step % 2) && <div id={"K-" + step}></div>}
  //         </div>
  //         <div id={"E-" + step}>
  //           <div id={"G-" + step}></div>
  //           {!!(step % 2) && <div id={"H-" + step}></div>}
  //           {!(step % 2) && <div id={"I-" + step}></div>}
  //           <div id={"J-" + step}></div>
  //         </div>
  //       </div>
  //       <div id={"C-" + step}></div>
  //       <div id="L">
  //         {!(step % 2) && <div key="M" id={"M-" + step}></div>}
  //         <div key="N" id={"N-" + step}></div>
  //         {!!(step % 2) && <div key="M" id={"M-" + step}></div>}
  //       </div>
  //     </div>
  //   );
  // }
}

ReactDOM.render(<Home />, document.getElementById("root"));
