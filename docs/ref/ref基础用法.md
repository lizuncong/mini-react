## Ref

ref 可以**直接**作用于下面的节点

- 用于 HTML 元素。ref.current 保存的是 dom 节点
- 用于 class 组件。ref.current 保存的是类组件的实例

> 函数组件**不能直接**使用 ref 属性，即我们不能直接将 ref 作为属性直接传递给函数组件，需要使用 React.forwardRef 转发

### 为 DOM 元素添加 ref

React 会在组件挂载时给 current 属性传入 DOM 元素，并在组件卸载时传入 null 值。ref 会在 componentDidMount 或 componentDidUpdate 生命周期钩子触发前更新。

```jsx
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.domRef = React.createRef();
  }
  componentDidMount() {
    console.log("dom节点ref：this.domRef", this.domRef);
  }

  render() {
    return <div ref={this.domRef}>dom Ref</div>;
  }
}
```

### 为类组件添加 ref

```jsx
class ClassCounter extends React.Component {
  constructor(props) {
    super(props);
  }
  getData() {
    console.log("获取数据");
  }
  render() {
    return <div>Class Counter</div>;
  }
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.classRef = React.createRef();
  }
  componentDidMount() {
    console.log("类组件ref：this.classRef", this.classRef);
    this.classRef.current.getData();
  }

  render() {
    return [<div ref={this.domRef}>dom Ref</div>];
  }
}
```

### 函数组件与 Ref

我们不能将 ref 直接传递给函数组件，这是 React 在调用 React.createElement 创建 element 时，会将 ref 属性剔除，ref 不会出现在组件的 props 中，比如下面的例子：

```jsx
const FunctionCounter = (props) => {
  const [count, setCount] = useState(0);
  console.log("props..", props);
  return <div ref={props.ref}>{`计数器：${count}-${props.name}`}</div>;
};

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.domRef = React.createRef();
  }
  componentDidMount() {
    console.log("dom节点ref：this.domRef", this.domRef);
  }

  render() {
    return <FunctionCounter ref={this.domRef} name="test" />;
  }
}
```

直接给函数组件 FunctionCounter 传递 ref 是不生效的，在 FunctionCounter 中通过 props.ref 是访问不了父组件 Home 传递的 ref 属性的。但是我们可以变通一下，比如传递自定义属性 myRef：

```jsx
const FunctionCounter = (props) => {
  const [count, setCount] = useState(0);
  console.log("props..", props);
  return <div ref={props.myRef}>{`计数器：${count}-${props.name}`}</div>;
};

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.domRef = React.createRef();
  }
  componentDidMount() {
    console.log("dom节点ref：this.domRef", this.domRef);
  }

  render() {
    return <FunctionCounter myRef={this.domRef} name="test" />;
  }
}
```

这实际上也是一种 ref 转发方式

## 回调 ref

传递给 ref 属性的是一个函数，同时不需要使用 createRef 创建一个 ref 对象。

React 将在组件挂载时，会调用 ref 回调函数并传入 DOM 元素或者类组件实例，当卸载时调用它并传入 null。在 componentDidMount 或 componentDidUpdate 触发前，React 会保证 refs 一定是最新的。

```jsx
class ClassCounter extends React.Component {
  constructor(props) {
    super(props);
  }
  getData() {
    console.log("获取数据");
  }
  render() {
    return <div>Class Counter</div>;
  }
}

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.classRef = null; // 不需要使用React.createRef
    this.domRef = null; // React.createRef
  }
  componentDidMount() {
    console.log("类组件ref：this.classRef", this.classRef);
    this.classRef.getData();
    console.log("dom节点ref：this.domRef", this.domRef);
  }

  render() {
    return [
      <div ref={(el) => (this.domRef = el)}>dom Ref</div>,
      <ClassCounter ref={(instance) => (this.classRef = instance)} />,
    ];
  }
}
```

## Ref 转发：React.forwardRef

```jsx
const FunctionCounter = (props, ref) => {
  const [count, setCount] = useState(0);
  return <div ref={ref}>{`计数器：${count}-${props.name}`}</div>;
};

const ForwardRefCounter = React.forwardRef(FunctionCounter);

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.domRef = null;
  }
  componentDidMount() {
    console.log("dom节点ref：this.domRef", this.domRef);
  }

  render() {
    return <ForwardRefCounter ref={(el) => (this.domRef = el)} name="test" />;
  }
}
```

## useImperativeHandle

useImperativeHandle 必须和 React.forwardRef 一起使用

```jsx
const FunctionCounter = (props, ref) => {
  const [count, setCount] = useState(0);
  useImperativeHandle(ref, () => ({
    focus: () => {
      console.log("focus...");
    },
  }));
  return <div>{`计数器：${count}-${props.name}`}</div>;
};

const ForwardRefCounter = React.forwardRef(FunctionCounter);

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.domRef = null; // React.createRef
  }
  componentDidMount() {
    console.log("dom节点ref：this.domRef", this.domRef);
  }

  render() {
    return <ForwardRefCounter ref={(el) => (this.domRef = el)} name="test" />;
  }
}
```
