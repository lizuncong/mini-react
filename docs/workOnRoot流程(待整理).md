### 开始WorkOnRoot

#### 从render到执行工作循环
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/react01.jpg)


![image](https://github.com/lizuncong/mini-react/blob/master/imgs/react02.jpg)


React源码中，如果一个节点只有一个子节点，而且这一个子节点是文本节点的话，不会为此子节点创建fiber优化