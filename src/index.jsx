import React from 'react';
import ReactDOM from 'react-dom';
// import App from './App'

// const container = document.getElementById('root');
// ReactDOM.render(<App />, container);


const element = (
    <div id="foo">
      <a>bar</a>
      <b />
    </div>
  )
  const container = document.getElementById("root")
  ReactDOM.render(element, container)