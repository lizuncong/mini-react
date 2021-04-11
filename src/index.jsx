// import React from 'react';
// import ReactDOM from 'react-dom';
import React from '../lib/index';
import ReactDOM from '../lib/react-dom';

//
// const element = (
//     <div id="foo">
//         this is a text
//         <div>
//             <a>this is a link</a>
//             bar
//         </div>
//         <br />
//     </div>
// )

const element = React.createElement(
    'div',
    { id: 'foo' },
    "this is a text",
    React.createElement('div', null, React.createElement('a', null, 'this is a link'), 'bar'),
    React.createElement('br')
)
console.log(element)

const container = document.getElementById('root');


ReactDOM.render(element, container);
