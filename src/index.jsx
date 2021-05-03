import React, { useState } from 'react';
import ReactDOM from 'react-dom';


const App = () => {
  const [count, setCount] = useState(0);
  console.log('count..', count);
  return (
      <div>
        计数器: { count }
        <div>
          <button
            onClick={() =>{
                console.log('11');
                setCount(count + 1)
            }}
          >
            add count
          </button>
        </div>
      </div>
  )
}
const container = document.getElementById('root');


ReactDOM.render(<App />, container);
