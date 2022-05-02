### state和props更新的深入理解
这篇文章介绍了React如何处理状态更新并且构建effects列表，帮助我们了解`render`和`commit`阶段的一些高级函数发生了什么。

特别是，我们将会看到在`completeWork`函数中，React是如何实现的：
- 更新`ClickCounter`state状态的count属性
- 调用`render`方法得到子节点列表并且进行比较
- 更新`span`元素的props

同时，在`commitRoot`函数中，React：
- 更新`span`元素的`textContent`属性
- 调用`componentDidUpdate`生命周期方法
```jsx
class ClickCounter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {count: 0};
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState((state) => {
            return {count: state.count + 1};
        });
    }
    
    componentDidUpdate() {}

    render() {
        return [
            <button key="1" onClick={this.handleClick}>Update counter</button>,
            <span key="2">{this.state.count}</span>
        ]
    }
}
```
在深入这些知识前，我们先快速看下，当我们点击按钮，并且在事件处理函数中调用`setState`时，react是如何调度的