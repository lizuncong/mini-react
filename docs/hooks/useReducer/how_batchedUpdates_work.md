### 批量更新场景
在合成事件等 `React` 能够接管的场景中，`setState` 是**批量更新**的。点击按钮，查看控制台可以发现只打印了一次：

render====== 2

```jsx
const Counter = () => {
  const [count, setCount] = useReducer(reducer, 0);
  console.log('render======', count)
  return (
    <button
      onClick={() => {
        debugger;
        setCount(1);
        setCount(2);
      }}
    >
      {count}
    </button>
  );
};
```

### 同步更新场景
在 `setTimeout`、`Promise回调` 等 `异步任务` 场景中，`setState` 是**同步更新**的。点击按钮，查看控制台可以发现打印了两句话：

render====== 1

render====== 2

```jsx
const Counter = () => {
  const [count, setCount] = useReducer(reducer, 0);
  console.log('render======', count)
  return (
    <button
      onClick={() => {
        setTimeout(() => {
          debugger;
          setCount(1);
          setCount(2);
        }, 0);
      }}
    >
      {count}
    </button>
  );
};
```