### React17 中 DOM DIFF 算法动机

在 React17+中，DOM DIFF 就是根据当前显示的页面对应的 Fiber 树和 `render` 函数生成的最新的 `element tree` 对比生成新的 Fiber 树的过程。然而将一棵树转换成另一棵树的最小操作次数，即使使用最优的算法，该算法的复杂程度仍为 O(n^3 )，其中 n 是树中元素的数量

如果在 `React` 中使用该算法，那么展示 1000 个元素则需要 10 亿次比较。这个开销实在是太过高昂。于是 React 在以下两个假设的基础之上提出了一套 O(n)的启发式算法：

- 两个不同类型的元素会产生出不同的树
- 开发者可以通过设置 key 属性，来告知渲染哪些子元素在不同的渲染下可以保存不变

### Diffing 算法

- 如果元素类型不同，则直接拆卸原有的树并重新构建新的树
- 如果两个元素类型相同，则保留 DOM 节点，仅比对及更新有改变的属性
- 组件元素类型相同时，组件实例保持不变

**在整个 diffing 过程中，同时使用 type 和 key 判断是否复用，首先判断 key，其次判断 type**

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
    <h1 key="h1-key">h1</h1>
    <h2 key="h2-key">h2</h2>
</div>
// 更新后的 element tree
<div>
    <h2 key="h2-key">h2</h2>
</div>
```

首先比较 `key`

- `h2-key` 和 `h1-key` 不同，则 `h1-key` 标记为删除
- 继续遍历旧的 fiber 树，`h2-key` 相同，同时 type 相同，则可以复用

如果旧的 fiber 树中，`h2` 后面还有 `h3`，`h4`等，依然只是保留 `h2`，将其他的删除

```jsx
<div>
    <h1 key="h1-key">h1</h1>
    <h2 key="h2-key">h2</h2>
    <h3 key="h3-key">h3</h3>
    <h4 key="h4-key">h4</h4>
</div>
// 更新后的 element tree
<div>
    <h2 key="h2-key">h2</h2>
</div>
```

当遍历到 `h2-key` 时，发现 `key` 和 `type` 都相同，因此 `h2` 可以复用，此时已经没有必要再继续比较接下来的节点，因此 `h3` 和 `h4` 都标记为删除

如果 `key` 相同， `type` 不同：

```jsx
<div>
    <h1 key="h1-key">h1</h1>
    <p key="h2-key">h2</p>
    <h3 key="h3-key">h3</h3>
    <h4 key="h4-key">h4</h4>
</div>
// 更新后的 element tree
<div>
    <h2 key="h2-key">h2</h2>
</div>
```

- 比较 `h1-key`，发现 `key` 不同，则 `h1` 标记为删除，继续遍历
- 比较 `h2-key` 发现 `key` 相同，比较 `type` 发现不同，则标记 `p` 删除，由于已经找到相同的 `key`，根据 react 的假设，已经没有必要再继续遍历下去了，因此 `h3` 和 `h4` 标记为删除。重新创建一个 `h2` 节点

### 多节点

注意，这里是指 `render` 函数重新生成的 `element tree` 的子节点有多个的情况

同理，多节点的情况，也是只有 `type` 和 `key` 都相同，才能复用，否则重新创建节点

- 节点有可能更新、删除、新增
- 多节点的时候会经历二轮遍历
- 第一轮遍历主要是处理节点的更新，更新包括属性和类型的更新，第二轮遍历处理新增、删除、移动的情况
- 移动时的原则是尽量少量的移动，如果必须有一个要动，新地位高的不动，新地位低的动

#### 第一种情况：更新

全部子节点都可以复用，只需要更新即可，这种只需要一轮循环

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

在这种情况中，由于 `key` 相同而 `type` 不同导致不可复用，则将 旧的 fiber 节点标记为删除，并继续遍历，此时不会跳出第一轮循环

```jsx
<ul>
    <li key="A-key">A</li>
    <li key="B-key">B</li>
    <li key="C-key">C</li>
    <li key="D-key">D</li>
</ul>

// 更新后：
<ul>
    <div key="A-key">A-new</div>
    <li key="B-key">B-new</li>
    <li key="C-key">C-new</li>
    <li key="D-key">D-new</li>
</ul>
```

首先判断 `key`

- `A-key` 相同，但是 `type` 不同，因此将 `<li key="A-key">A</li>` 标记为删除，重新创建 `<div key="A-key">A-new</div>` 节点
- 由于其余节点的 `key` 和 `type` 都相同，因此都可以复用

#### 第三种情况：key 不同，退出第一轮循环

如果第一轮遍历的时候，发现 key 不一样，则立刻跳出第一轮循环。key 不一样，说明可能有位置变化

```jsx
<ul>
    <li key="A-key">A</li>          // oldIndex 为0
    <li key="B-key">B</li>          // oldIndex 为1
    <li key="C-key">C</li>          // oldIndex 为2
    <li key="D-key">D</li>          // oldIndex 为3
    <li key="E-key">E</li>          // oldIndex 为4
    <li key="F-key">F</li>          // oldIndex 为5
</ul>

// 更新后：
<ul>
    <li key="A-key">A-new</li>
    <li key="C-key">C-new</li>
    <li key="E-key">E-new</li>
    <li key="B-key">B-new</li>
    <li key="G-key">G-new</li>
</ul>
```

第一轮循环：

- `A-key` 相同并且 `type` 相同，能复用，更新 A 就可以
- `B-key` 和 `C-key` 不同，立即退出第一轮循环，初始化 `lastPlacedIndex` 为旧的 fiber `A-key`的索引。
  `lastPlacedIndex` 表示最近的一个可复用的节点在 旧 fiber 节点中的位置索引
- 从 `B-key` 节点开始遍历旧的 fiber 节点，并构造一个 map：

```js
const fiberMap = { "B-key": B, "C-key": C, "D-key": D, "E-key": E, "F-key": F };
```

`fiberMap` 的键值是元素的 `key`，值对应元素的 `fiber` 节点

- 继续遍历剩余的 新的子节点
- `C-key` 在 `fiberMap` 中存在，并且旧的 `C-key` 节点的 `oldIndex = 2 大于 lastPlacedIndex = 0`，因此 `C-key` 不需要移动，标记更新即可。将 `lastPlacedIndex` 设置为 `C-key` 的 `oldIndex`，此时 `lastPlacedIndex = 2`。同时将 `C-key` 从 `fiberMap` 中删除，最终得到

```jsx
lastPlacedIndex = 2;
fiberMap = { "B-key": B, "D-key": D, "E-key": E, "F-key": F };
```

- `E-key` 在 `fiberMap` 中存在，同时 `E-key` 节点的 `oldIndex` 也大于 `lastPlacedIndex`，同 `C-key` 一样不需要移动，标记为更新即可，最终得到：

```jsx
lastPlacedIndex = 4; // 将lastPlacedIndex设置为 `E-key` 的oldIndex
fiberMap = { "B-key": B, "D-key": D, "F-key": F }; // 从 fiberMap中删除 `E-key`
```

- `B-key` 在 `fiberMap` 中存在，**需要注意，由于 `B-key` 的 `oldIndex` 小于 `lastPlacedIndex`，因此这个节点需要标记为移动并且更新**，最终得到：

```jsx
lastPlacedIndex = 4; // lastPlacedIndex不变
fiberMap = { "D-key": D, "F-key": F }; // 从 fiberMap中删除 `B-key`
```

- `G-key` 在 `fiberMap` 中不存在，因此这是一个新增的节点

- 到此，新的节点已经遍历完成，将 `fiberMap` 中剩余的旧节点都标记为删除

- 最后，在 commit 阶段，先删除 D 和 F，再更新 A、C 和 E，然后移动并更新 B，最后插入 G

#### 第四种情况：极端场景，前面的节点都需要移动

这种场景将后面的节点移动到了前面，性能不好，因此应该避免这种写法

```jsx
<ul>
    <li key="A-key">A</li>  // oldIndex 0
    <li key="B-key">B</li>  // oldIndex 1
    <li key="C-key">C</li>  // oldIndex 2
    <li key="D-key">D</li>  // oldIndex 3
</ul>

// 更新后：
<ul>
    <li key="D-key">D</li>
    <li key="A-key">A</li>
    <li key="B-key">B</li>
    <li key="C-key">C</li>
</ul>
```

第一轮遍历：

- `D-key` 和 `A-key` 不同，`key` 改变了，不能复用，跳出第一轮循环

第二轮循环

初始化 `lastPlacedIndex = 0`，并创建一个旧的 fiber 节点的映射

```js
const fiberMap = { "A-key": A, "B-key": B, "C-key": C, "D-key": D };
```

- `D-key` 在 `fiberMap` 中存在，并且 `oldIndex > lastPlacedIndex` ，因此可以复用并且标记为更新，不需要移动

```js
lastPlacedIndex = 3; // 将 lastPlacedIndex 设置为 D-key 的 oldIndex
const fiberMap = { "A-key": A, "B-key": B, "C-key": C }; // 将 D-key 从 fiberMap 中删除
```

- 继续遍历接下来的节点，可想而知，由于 `lastPlacedIndex` 都大于这些节点的 `oldIndex`，因此这些节点都需要标记为移动并且更新

从中可以看出，这种更新，react 并不会仅仅将 D-key 节点移动到前面，而是将 A-key，B-key，C-key 都移动到 D-key 后面。

**因此我们需要避免将节点从后面移动到前面的操作**
