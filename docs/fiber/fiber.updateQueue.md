> 在容器节点的 fiber 中，即 hostRootFiber.updateQueue 是一个环状链表：{ payload: element}。在原生的 html 标签中，比如 div，span，对应的 fiber 节点，他们的 updateQueue 是一个数组：updatePayload。在类组件中，类组件对应的 fiber 节点，updateQueue 保存的是更新队列，也是一个环状链表
