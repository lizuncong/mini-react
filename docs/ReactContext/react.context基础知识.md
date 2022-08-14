## 理论知识

与 React Context 相关的 API

- React.createContext
- Context.Provider
- Class.contextType
- Context.Consumer
- useContext。唯一的 Hook
- Context.displayName

这些 api 按用途可以划分如下：

- 创建 context: React.createContext
- 提供 context 值: Context.Provider
- 订阅 context 值：
  - Class.contextType。用于类组件订阅 Context
  - Context.Consumer。用于函数组件订阅 Context
  - useContext。用于函数组件订阅 Context

### 创建 context：React.createContext

```javascript
const MyContext = React.createContext(defaultValue);
```

返回一个包含 `Provider` 和 `Consumer` 的 `MyContext` 对象

当组件树中没有对应的 `Provider` 组件时，`defaultValue` 才生效

### Context.Provider

```javascript
<MyContext.Provider value={/* 某个值 */}>
```

`Provider` 接收一个 `value` 属性。**_当 `value` 变化时，所有订阅的组件都会强制刷新，不受限于 `shouldComponentUpdate`_**

> 当 Provider 的 value 值发生变化时，它内部的所有消费组件都会重新渲染。从 Provider 到其内部 consumer 组件（包括 .contextType 和 useContext）的传播不受制于 shouldComponentUpdate 函数，因此当 consumer 组件在其祖先组件跳过更新的情况下也能更新。

### 订阅 Context

react 提供了三个订阅 `context` 的 api

- MyClass.contextType = MyContext。用于类组件
- MyContext.Consumer。用于函数组件
- useContext。用于函数组件

#### 类组件订阅 Context：contextType

```jsx
class ThemedButton extends React.Component {
  static contextType = ThemeContext;
  render() {
    return <button id="button类组件">{this.context}</button>;
  }
}
```

#### 函数组件订阅 Context：Consumer

```jsx
function ThemeFooter() {
  return (
    <div id="footer">
      <ThemeContext.Consumer>{(value) => value}</ThemeContext.Consumer>
    </div>
  );
}
```

#### 函数组件订阅 Context：useContext

```javascript
function ThemeHeader() {
  const value = useContext(ThemeContext);

  return <div id="header函数组件">{value}</div>;
}
```

目前 `useContext` 是 `react` 官方提供的唯一一个与 `context` 有关的 hook api

#### 订阅多个 context

如果需要订阅多个 context，可以通过`Context.Consumer` 组件。

```jsx
class App extends React.Component {
  render() {
    return (
      <ThemeContext.Provider value={theme}>
        <UserContext.Provider value={signedInUser}>
          <Layout />
        </UserContext.Provider>
      </ThemeContext.Provider>
    );
  }
}
function Content() {
  return (
    <ThemeContext.Consumer>
      {(theme) => (
        <UserContext.Consumer>
          {(user) => <ProfilePage user={user} theme={theme} />}
        </UserContext.Consumer>
      )}
    </ThemeContext.Consumer>
  );
}
```

函数组件还可以通过 useContext 订阅多个 context
