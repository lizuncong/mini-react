### 开始WorkOnRoot

#### 从render到执行工作循环
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/react01.jpg)


![image](https://github.com/lizuncong/mini-react/blob/master/imgs/react02.jpg)


React源码中，如果一个节点只有一个子节点，而且这一个子节点是文本节点的话，不会为此子节点创建fiber优化



1.根据虚拟DOM创建新的fiber树

2.把新的fiber树的内容同步到真实DOM中


### collectEffectList
- 为了避免遍历fiber树寻找有副作用的fiber节点，所以有了effectList
- 在 fiber 树构建过程中，每当一个 fiber 节点的 flags 字段不为 NoFlags 时(代表需要执行副作用)，就把该fiber节点添加到
effectList 中
- effectList是一个单向链表，firstEffect代表链表中的第一个fiber节点，lastEffect代表链表中的最后一个fiber节点
- fiber树的构建是深度优先的，也就是先向下构建子级fiber节点，子级节点构建完成后，再向上构建父级fiber节点，所以effectlist中总是子级fiber节点在前面
- fiber节点构建完成的操作执行在 completeUnitOfWork方法，在这个方法里，不仅会对节点完成构建，也会将有flags的fiber节点添加到effectList中