import React, { useState, useEffect } from 'react';
import ajax from './request'

function App() {
  const [ facts, setFacts ] = useState([]);
  const [ listening, setListening ] = useState(false);

  // useEffect( () => {
  //   if (!listening) {
  //     const events = new EventSource('/api/events', { withCredentials: true });
  //     events.onmessage = (event) => {
  //       const parsedData = JSON.parse(event.data);

  //       setFacts((facts) => facts.concat(parsedData));
  //     };
  //     events.onerror = function(err) {
  //       console.error("EventSource failed:", err);
  //     };

  //     setListening(true);
  //   }
  // }, [listening, facts]);
  // useEffect(() => {
  //   ajax()
  // }, [])

  return (
    <>
      <button onClick={() => { ajax('/login')}}>登录</button>
      <button
        onClick={() => {
          ajax('/get')
        }}
      >
        get请求
      </button>
      <table className="stats-table">
        <thead>
          <tr>
            <th>tesw</th>
            <th>test</th>
          </tr>
        </thead>
        <tbody>
          {
            facts.map((fact, i) =>
              <tr key={i}>
                <td>{fact.info}</td>
                <td>{fact.source}</td>
              </tr>
            )
          }
        </tbody>
      </table>
    </>
  );
}

export default App;