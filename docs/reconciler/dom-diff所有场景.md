## 单节点

单节点指的是更新后的元素只有一个的场景

### 多节点变单节点，key 和 type 都相同

多节点变单节点，key 和 type 都相同，则可以复用

```js
// 更新前
<ul key="ul">
  <li key="A" id="A">A</li>
  <li key="B" id="B">B</li>
  <li key="C" id="C">C</li>
</ul>
// 更新后
<ul key="ul">
  <li key="B" id="B">B</li>
</ul>
```

这里 `li#B` 可以复用旧的节点，其余节点全部删除

### 多节点变单节点，key 相同 type 不同，则不能复用

```js
// 更新前
<ul key="ul">
  <li key="A" id="A">A</li>
  <li key="B" id="B">B</li>
  <li key="C" id="C">C</li>
</ul>
// 更新后
<ul key="ul">
  <p key="B" id="B">B</p>
</ul>
```

将旧节点`li#A`、`li#B`、`li#C`全部删除，为 `p#B` 创建新的 fiber 节点

## 多节点

多节点指的是更新后的元素有多个的场景。在对多节点 dom diff 过程中，React 首先采用一轮 for 循环同时遍历新旧节点，如果遇到 key 不同的节点，则直接退出当前 for 循环，并将剩下的 fiber 节点存入 map 中，然后继续遍历新的元素，从 map 中查找旧的 fiber 节点，看看是否可以复用。

以下面的 demo 为例：

```js
// 更新前
<ul key="ul">
  <li key="A" id="A">A</li>
  <li key="B" id="B">B</li>
  <li key="C" id="C">C</li>
  <li key="D" id="D">D</li>
  <li key="E" id="E">E</li>
  <li key="F" id="F">F</li>
</ul>
// 更新后
<ul key="ul">
  <li key="A" id="A">A</li>
  <li key="B2" id="B2">B2</li>
  <li key="E" id="E">E</li>
  <li key="C" id="C">C</li>
  <li key="F" id="F">F</li>
</ul>
```

- 第一轮 for 循环同时遍历旧的 fiber 节点和新的 element 节点，当比较到`li#B` 和`li#B2`时，发现两者`key`不同，则直接结束当前 for 循环。
- 将剩下的 fiber 节点存入 map 中，以 key 做为键(如果 key 为 null，则以 index 做为键)

```js
const existingChildren = {
  B: fiberB,
  C: fiberC,
  D: fiberD,
  E: fiberE,
  F: fiberF,
};
```

- 从`li#B2`开始继续遍历剩下的新的 element，在`existingChildren`中查找是否存在`key`和`type`都相同的 fiber 节点，如果存在，则复用 fiber 节点，并将 fiber 节点从`existingChildren`删除

- 新的 element 遍历完成后，如果`existingChildren`还有没复用的 fiber 节点，则将`existingChildren`剩下的全部删除

### 新旧节点数量相同，key 和 type 都相同

这种场景下全部可以复用旧的节点

```js
// 更新前
<ul key="ul">
  <li key="A" id="A">A</li>
  <li key="B" id="B">B</li>
  <li key="C" id="C">C</li>
</ul>
// 更新后
<ul key="ul">
  <li key="A" id="A">A2</li>
  <li key="B" id="B">B2</li>
  <li key="C" id="C">C2</li>
</ul>
```

### 新旧节点数量相同，有的 type 不同

删除 `li#B` 节点，为 `p#p` 创建新的 fiber 节点，同时继续遍历后面的节点。

除了 `li#B` 不能复用外，其余节点均可以复用

```js
// 更新前
<ul key="ul">
  <li key="A" id="A">A</li>
  <li key="B" id="B">B</li>
  <li key="C" id="C">C</li>
</ul>
// 更新后
<ul key="ul">
  <li key="A" id="A">A2</li>
  <p key="B" id="p">p</p>
  <li key="C" id="C">C2</li>
</ul>
```

**type 不同并不会提前退出循环，而是会继续遍历下面的节点**

### 新节点变少，同时 key 和 type 均相同

```js
// 更新前
<ul key="ul">
  <li key="A" id="A">A</li>
  <li key="B" id="B">B</li>
  <li key="C" id="C">C</li>
  <li key="D" id="D">D</li>
</ul>
// 更新后
<ul key="ul">
  <li key="A" id="A">A2</li>
  <li key="B" id="B">B2</li>
</ul>
```

这种情况下，新的元素先遍历完成，**第一轮 for 循环结束**，由于`key`和`type`都相同，因此可以复用 `li#A`以及`li#B`。

由于旧的 fiber 节点还没遍历完，因此继续遍历剩下的`li#C`和`li#D`节点，并全部标记为删除

### 新节点增加，同时 key 和 type 均相同

```js
// 更新前
<ul key="ul">
  <li key="A" id="A">A</li>
  <li key="B" id="B">B</li>
</ul>
// 更新后
<ul key="ul">
  <li key="A" id="A">A2</li>
  <li key="B" id="B">B2</li>
  <li key="C" id="C">C2</li>
  <li key="D" id="D">D2</li>
  <li key="E" id="E">E2</li>
</ul>
```

这种情况下，旧的 fiber 节点先遍历完成，**第一轮 for 循环结束**，由于`key`和`type`都相同，因此可以复用 `li#A`以及`li#B`。

同时，由于新的元素 `C`、 `D`、 `E`还没遍历完成，因此继续遍历这几个元素，并为他们创建新的 fiber 节点
