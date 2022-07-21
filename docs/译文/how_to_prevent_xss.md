## JSX

先来简单复习一下 JSX 的基础知识。JSX 是`React.createElement的语法糖`

```js
<div id="container">hello</div>
```

经过 `babel` 编译后：

```js
React.createElement(
  "div" /* type */,
  { id: "container" } /* props */,
  "hello" /* children */
);
```

`React.createElement`最终返回的结果就是一个对象，如下：

```js
{
  type: 'div',
  props: {
    id: 'container',
    children: 'hello',
  },
  key: null,
  ref: null,
  $$typeof: Symbol.for('react.element'),
}
```

这就是一个 React element 对象。

我们甚至可以在代码中直接写 React element 对象，React 照样能正常渲染我们的内容：

```jsx
render() {
  return (
    <div>
      {{
        $$typeof: Symbol.for('react.element'),
        props: {
          dangerouslySetInnerHTML: {
            __html: '<img src="x" onerror="alert(1)">'
          },
        },
        ref: null,
        type: "div",
      }}
    </div>
  );
}
```

可以复制这段代码本地运行一下，可以发现浏览器弹出一个弹窗，并且`img`已经插入了 dom 中。

**这里，`$$typeof` 的作用是啥？为什么使用 `Symbol()` 作为值？**

在了解之前，我们先来简单看下 `XSS` 攻击

## XSS 攻击

我们经常需要构造 HTML 字符串并插入到 DOM 中，比如：

```js
const messageEl = document.getElementById("message");
var message = "hello world";
messageEl.innerHTML = "<p>" + message + "</p>";
```

页面正常显示。但是如果我们插入一些恶意代码，比如：

```js
const messageEl = document.getElementById("message");
var message = '<img src onerror="alert(1)">';
messageEl.innerHTML = "<p>" + message + "</p>";
```

此时页面就会弹出一个弹窗，弹窗内容显示为 1

**因此，直接使用 innerHTML 插入文本内容，存在 XSS 攻击的风险**

### 防止 XSS 攻击的方法

为了解决类似的 XSS 攻击方法，我们可以使用一些安全的 API 添加文本内容，比如：

- 使用 `document.createTextNode('hello world')` 插入文本节点。
- 或者使用 `textContent` 而不是 `innerHTML` 设置文本内容。
- 对于一些特殊字符，比如 `<`、`>`，我们可以进行转义，将其转换为 `&#60;` 以及 `&#62;`
- 对于富文本内容，我们可以设置黑名单，过滤一些属性，比如 `onerror` 等。

## React 对于文本节点的处理

React 使用 `createTextNode` 或者 `textContent` 设置文本内容。对于下面的代码

```jsx
render() {
  const { count } = this.state
  return (
    <div onClick={() => this.setState({ count: count + 1})}>
      {count}
    </div>
  );
}
```

React 在渲染过程中会调用`setTextContent`方法为`div`节点设置内容，其中，第一次渲染时，直接设置`div`节点的`textContent`，第二次或者第二次以后的更新渲染，由于第一次设置了`textContent`，因此`div`的`firstChild`值存在，是个文本节点。此时直接更新这个文本节点的`nodeValue`即可

```js
var setTextContent = function (node, text) {
  if (text) {
    var firstChild = node.firstChild;
    // 如果当前node节点已经设置过textContent，则firstChild不为空，是个文本节点TEXT_NODE
    if (
      firstChild &&
      firstChild === node.lastChild &&
      firstChild.nodeType === TEXT_NODE
    ) {
      firstChild.nodeValue = text;
      return;
    }
  }
  // 第一次渲染，直接设置textContent
  node.textContent = text;
};
```

**综上，对于普通的文本节点来说，由于 React 是采用 textContent 或者 createTextNode 的方式添加的，因此是不会存在 XSS 攻击的，即使上面示例中，count 的值为 `'<img src="x" onerror="alert(1)">'`也不会有被攻击的风险**

### dangerouslySetInnerHTML 处理富文本节点

有时候我们确实需要显示富文本的内容，React 提供了`dangerouslySetInnerHTML`方便我们显式的插入富文本内容

```jsx
render() {
  return (
    <div
      id="dangerous"
      dangerouslySetInnerHTML={{ __html: '<img src="x" onerror="alert(1)">' }}
    >
    </div>
  );
}
```

React 在为 DOM 更新属性时，会判断属性的`key`是不是`dangerouslySetInnerHTML`，如果是的话，调用`setInnerHTML` 方法直接给 dom 的`innerHTML`属性设置文本内容

```js
function setInitialDOMProperties(
  tag,
  domElement,
  rootContainerElement,
  nextProps
) {
  for (var propKey in nextProps) {
    if (propKey === "dangerouslySetInnerHTML") {
      var nextHtml = nextProp ? nextProp.__html : undefined;
      if (nextHtml != null) {
        setInnerHTML(domElement, nextHtml);
      }
    }
  }
}
var setInnerHTML = function (node, html) {
  node.innerHTML = html;
};
```

可以看出，React 在处理富文本时，也仅仅是简单的设置 DOM 的`innerHTML`属性来实现的。

**对于富文本潜在的安全风险，交由开发者自行把控。**

## $$typeof 的作用

```js
render() {
  const { text } = this.state
  return (
    <div>
      {text}
    </div>
  );
}
```

假设这个`text`是从后端返回来的，同时后端允许用户存储 JSON 对象，如果用户传入下面这样的一个类似 React element 的对象：

```js
{
  type: "div",
  props: {
    dangerouslySetInnerHTML: {
      __html: '<img src="x" onerror="alert(1)">'
    },
  },
  ref: null
}
```

别忘了前面说过，我们在 JSX 中直接插入 React element 对象也是能够正常渲染的。

在这种情况下，在`React0.13`版本时，这是一个潜在的`XSS`攻击，这个漏洞源于服务端。如果攻击者恶意伪造一个类似 React element 对象的数据返回给前端，React 就会执行恶意代码。但是 React 可以采取措施预防这种攻击。

从`React0.14`版本开始，React 为每个 element 都添加了一个`Symbol`标志：

```js
{
  $$typeof: Symbol.for('react.element'),
  props: {
    id: 'container'
  },
  ref: null,
  type: "div",
}
```

这个行得通，是因为 JSON 不支持`Symbol`。因此即使是服务端有风险漏洞并且返回一个 JSON，这个 JSON 也不会包含`Symbol.for('react.element').`，在 Reconcile 阶段，React 会检查`element.$$typeof`标志是否合法。不合法的话直接报错，React 不能接受对象作为 children

专门使用 Symbol.for() 的好处是， Symbols 在 iframe 和 worker 等环境之间是全局的。因此，即使在更奇特的条件下，Symbols 也能在不同的应用程序之间传递受信任的元素。同样，即使页面上有多个 React 副本，它们仍然可以“同意”有效的 $$typeof 值

如果浏览器不支持`Symbols`，React 使用`0xeac7`代替

```js
{
  $$typeof: '0xeac7',
}
```

## 参考链接

- https://overreacted.io/why-do-react-elements-have-typeof-property/
