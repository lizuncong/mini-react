### 先简单理解react的解析过程
```jsx
// jsx
// const element = <h1 title="foo">Hello</h1>

// jsx被babel转换成 React.createElement
// const element = React.createElement(
//     "h1",
//     { title: 'foo' },
//     "Hello"
// )

// React.createElement最终返回的元素对象长这样，这就是virtual dom
const element = {
    type: 'h1',
    props: {
        title: 'foo',
        children: 'Hello',
    }
}

const container = document.getElementById('root');

ReactDOM.render(element, container);
```
