import React, { useState, useEffect } from 'react';
import ajax from './concurrent_request'

function App() {
  const [ facts, setFacts ] = useState([]);
  const [ listening, setListening ] = useState(false);


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