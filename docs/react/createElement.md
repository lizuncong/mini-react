### jsx
jsx经过babel编译会变成`React.createElement`方法，该方法返回一个对象
```jsx
const element = <div key="title" id="title">title</div>
// 经过babel编译，实际上就是
// const element = React.createElement(
//   "div",
//   {
//     key: "title",
//     id: "title"
//   },
//   "title"
// );

console.log(element)

// 控制台输出，createElement返回的就是一个对象
{
    $$typeof: Symbol(react.element),
    key: "title",
    props: {
        id: 'title', 
        children: 'title'
    },
    ref: null,
    type: "div",
    _owner: null,
    _store: {
        validated: false
    }
    _self: null,
    _source: null
}
```


### React.createElement
React.createElement返回的对象就是一个虚拟DOM对象，描述了真实dom的信息