### React17中DOM DIFF算法
在React17+中，DOM DIFF 就是根据老的Fiber树和最新的JSX对比生成新的Fiber树的过程

### React优化原则
- 只对同级节点进行对比，如果DOM节点跨层级移动，则React不会复用
- 不同类型的元素会产出不同的结构，会销毁老结构，创建新结构
- 可以通过key标识移动的元素

### 单节点
- 如果新的子节点只有一个元素，如果存在老Fiber的DOM元素，则需要判断老Fiber的DOM节点是否可以复用
    + 如果key和type都相同才可以复用
    + 如果key或者type不同，则给老Fiber添加删除标记，并生成新的Fiber节点
```jsx
<div>
    <h1 key="null">h1</h1>
</div>
// 更新后的
<div>
    <h2 key="null">h2</h2>
</div>
```

### 多节点
- 如果新的节点有多个节点
- 节点有可能更新、删除、新增
- 多节点的时候会经历二轮遍历
- 第一轮遍历主要是处理节点的更新，更新包括属性和类型的更新
- 移动时的原则是尽量少量的移动，如果必须有一个要动，新地位高的不动，新地位低的动

#### 第一种情况：更新
```jsx
<ul>
    <li key="A">A</li>
    <li key="B">B</li>
    <li key="C">C</li>
    <li key="D">D</li>
</ul>

// 更新后：
<ul>
    <li key="A">A-new</li>
    <li key="B">B-new</li>
    <li key="C">C-new</li>
    <li key="D">D-new</li>
</ul>
```
#### 第二种情况：移动
如果第一轮遍历的时候，发现key不一样，则立刻跳出第一轮循环。key不一样，说明可能有位置变化
```jsx
<ul>
    <li key="A">A</li>
    <li key="B">B</li>
    <li key="C">C</li>
    <li key="D">D</li>
    <li key="E">E</li>
    <li key="F">F</li>
</ul>

// 更新后：
<ul>
    <li key="A">A-new</li>
    <li key="C">C-new</li>
    <li key="E">E-new</li>
    <li key="B">B-new</li>
    <li key="G">G-new</li>
</ul>
```
第一轮循环：
- A=A能复用，更新A就可以
- B和C对比，KEY不一样，则马上跳出第一轮循环，进入第二轮循环

第二轮循环：
- 创建一个老节点的映射 const map = { 'B': B, 'C': C, 'D': D, 'E': E, 'F': F }
- 继续遍历新的节点
    + C节点去map里找，如果有key为C的fiber节点，说明位置变了，老节点可以复用(fiber和dom元素可以复用) 
    + 如果map中的节点被匹配并复用，则从map中删除该节点，最后map只剩下D和F没有被复用，这两个节点被标记为删除

从下图可以看出，先删除D和F，再更新A、C和E，然后移动并更新B，最后插入G
 ![image](https://github.com/lizuncong/mini-react/blob/master/imgs/diff-01.jpg)
