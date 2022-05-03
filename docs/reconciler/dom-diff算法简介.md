### React17 中 DOM DIFF 算法动机

在 React17+中，DOM DIFF 就是根据当前显示的页面对应的 Fiber 树和 `render` 函数生成的最新的 `element tree` 对比生成新的 Fiber 树的过程。然而将一棵树转换成另一棵树的最小操作次数，即使使用最优的算法，该算法的复杂程度仍为 O(n^3 )，其中 n 是树中元素的数量

如果在 `React` 中使用该算法，那么展示 1000 个元素则需要 10 亿次比较。这个开销实在是太过高昂。于是 React 在以下两个假设的基础之上提出了一套 O(n)的启发式算法：

- 两个不同类型的元素会产生出不同的树
- 开发者可以通过设置 key 属性，来告知渲染哪些子元素在不同的渲染下可以保存不变

### Diffing 算法

- 如果元素类型不同，则直接拆卸原有的树并重新构建新的树
- 如果两个元素类型相同，则保留 DOM 节点，仅比对及更新有改变的属性
- 组件元素类型相同时，组件实例保持不变

**在整个 diffing 过程中，同时使用 type 和 key 判断是否复用**

### 为什么需要 key

在子元素列表末尾新增元素时，更新开销比较小，比如：

```jsx
<ul>
  <li>first</li>
  <li>second</li>
</ul>

<ul>
  <li>first</li>
  <li>second</li>
  <li>third</li>
</ul>
```

React 会先匹配两个 `<li>first</li>` 对应的树，然后匹配第二个元素 `<li>second</li>` 对应的树，最后插入第三个元素的 `<li>third</li>` 树。

如果只是简单的将新增元素插入到表头，那么更新开销会比较大，比如：

```jsx
<ul>
  <li>Duke</li>
  <li>Villanova</li>
</ul>

<ul>
  <li>Connecticut</li>
  <li>Duke</li>
  <li>Villanova</li>
</ul>
```

React 并不会意识到应该保留 `<li>Duke</li>` 和 `<li>Villanova</li>`，而是会重建每一个子元素。这种情况会带来性能问题

可以得知：

**插入表尾比表头性能要好很多**

因此我们可以使用 `key` 告诉 `react` 复用元素

### 单节点

记住，这里是指 `render` 函数重新生成的 `element tree` 的子节点只有一个的情况

单节点，只有 `type` 和 `key` 都相同才可以复用，否则重新创建一个新的节点

如果新的 `element tree` 子节点只有一个元素：

- 如果不存在旧的 fiber 的 DOM 节点，则重新生成新的 fiber 节点
- 如果存在旧的 fiber 的 DOM 节点：
  - 如果 key 和 type 都相同才可以复用
  - 如果 key 或者 type 不同，则给旧的 fiber 添加删除标记，并生成新的 fiber 节点

#### 第一种场景 type 不同

```jsx
// 旧的 fiber 树
<div>
    <h1 key="null">h1</h1>
</div>
// 更新后的 element tree
<div>
    <h2 key="null">h2</h2>
</div>
```

#### 第二种场景 多节点变为单节点

```jsx
// 旧的 fiber 树
<div>
    <h1 key="h1">h1</h1>
    <h2 key="h2">h2</h2>
</div>
// 更新后的 element tree
<div>
    <h2 key="h2">h2</h2>
</div>
```

旧的 fiber 树有两个节点 `h1` 和 `h2`。 新的 `<h2 key="h2">h2</h2>` 和旧的 `<h1 key="h1">h1</h1>` 比较，发现 `<h1 key="h1">h1</h1>` 不能复用，则标记为删除。新的 `<h2 key="h2">h2</h2>` 和旧的 `<h2 key="h2">h2</h2>`相比，发现 `key` 和 `type` 相同，则可以复用。因此这个场景中只需要把 `h1` 删除即可。如果旧的 fiber 树中，`h2` 后面还有 `h3`，`h4`等，依然只是保留 `h2`，将其他的删除

```jsx
<div>
    <h1 key="h1">h1</h1>
    <h2 key="h2">h2</h2>
    <h3 key="h3">h3</h3>
    <h4 key="h4">h4</h4>
</div>
// 更新后的 element tree
<div>
    <h2 key="h2">h2</h2>
</div>
```

只保留 `h2` 其他节点删除

### 多节点

注意，这里是指 `render` 函数重新生成的 `element tree` 的子节点有多个的情况

同理，多节点的情况，也是只有 `type` 和 `key` 都相同，才能复用，否则重新创建节点

- 节点有可能更新、删除、新增
- 多节点的时候会经历二轮遍历
- 第一轮遍历主要是处理节点的更新，更新包括属性和类型的更新，第二轮遍历处理新增、删除、移动的情况
- 移动时的原则是尽量少量的移动，如果必须有一个要动，新地位高的不动，新地位低的动

#### 第一种情况：更新

全部子节点都可以复用，只需要更新即可

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

#### 第二种情况：key 相同，type 不同

```jsx
<ul>
    <li key="A">A</li>
    <li key="B">B</li>
    <li key="C">C</li>
    <li key="D">D</li>
</ul>

// 更新后：
<ul>
    <div key="A">A-new</div>
    <li key="B">B-new</li>
    <li key="C">C-new</li>
    <li key="D">D-new</li>
</ul>
```

由于子节点 `key` 都相同，因此这里只需要一轮循环，执行以下操作：

- 删除老的 `<li key="A">A</li>` 节点
- 插入新的 `<div key="A">A-new</div>` 节点
- 更新 `B`、`C`、`D` 节点

#### 第三种情况：移动

如果第一轮遍历的时候，发现 key 不一样，则立刻跳出第一轮循环。key 不一样，说明可能有位置变化

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

- A=A 能复用，更新 A 就可以
- B 和 C 对比，KEY 不一样，则马上跳出第一轮循环，进入第二轮循环

第二轮循环：

- 创建一个老节点的映射 const map = { 'B': B, 'C': C, 'D': D, 'E': E, 'F': F }
- 继续遍历新的节点
  - C 节点去 map 里找，如果有 key 为 C 的 fiber 节点，说明位置变了，老节点可以复用(fiber 和 dom 元素可以复用)
  - 如果 map 中的节点被匹配并复用，则从 map 中删除该节点，最后 map 只剩下 D 和 F 没有被复用，这两个节点被标记为删除

从下图可以看出，先删除 D 和 F，再更新 A、C 和 E，然后移动并更新 B，最后插入 G
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/diff-01.jpg)
