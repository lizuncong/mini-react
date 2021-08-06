import React, { useState, useEffect } from 'react';
import { post } from './ajax'
function App() {
  const [ data, setData ] = useState([]);
  const [clients, setClients] = useState([])
  useEffect(() => {
      const evtSource = new EventSource('http://localhost:3001/connect');
      // onmessage监听从服务器发送来的所有没有指定事件类型的消息(没有event字段的消息)
      evtSource.onmessage = (event) => {
        console.log('没有指定事件类型的消息...', event)
        const parsedData = JSON.parse(event.data);
        setData(parsedData);
      };

      // 使用addEventListener()方法来监听其他类型的事件
      // 只有在服务器发送的消息中包含一个值为"client"的event字段的时候才会触发对应的处理函数
      evtSource.addEventListener("client", function(event) {
        console.log('client....', event.data)
        setClients(JSON.parse(event.data))
      });

      evtSource.onerror = function(err) {
        console.error("EventSource failed:", err);
      };
  }, []);

  return (
    <div>
        data: {JSON.stringify(data)}
        <div>
            <button
                onClick={() => {
                    post('/addPerson', {name: 'lzc2', age: 22 })
                }}
            >
                新增一个数据
            </button>
        </div>
        <div>连接的客户端：{JSON.stringify(clients)}</div>
    </div>
  );
}

export default App;