### event.target VS event.currentTarget
- 两者都是只读属性
- event.target。触发事件的元素，可以用来实现`事件委托`。
- event.currentTarget。绑定事件的元素，这在多个元素绑定同一个事件时尤其有用
- 当事件处理函数是在冒泡或者捕获阶段触发时，`event.target` 和 `event.currentTarget` 不同。只有当绑定和触发都是同一个元素时，两者才相同
```html
<body>
  <div id="root">
    <div id="parent" >
      <button id="child">事件执行</button>
    </div>
  </div>
  <script>
    const root = document.getElementById('root')
    const parent = document.getElementById('parent')
    const child = document.getElementById('child')

    // 点击按钮，冒泡阶段触发
    parent.addEventListener('click', (e) => {
        console.log('parent监听click事件', e.target) // child。触发事件的是child
        console.log('parent监听click事件', e.currentTarget) // parent。绑定事件的是parent
    })
    // 点击按钮，冒泡阶段触发
    child.addEventListener('click', (e) => {
        console.log('child监听click事件', e.target) // child。触发事件的是child
        console.log('child监听click事件', e.currentTarget) // child。绑定事件的是child
    })
  </script>
</body>
```


### 事件冒泡 VS 事件捕获
- 事件捕获
- 事件目标
- 事件冒泡
- 事件委托。react合成事件就是基于事件委托
- 先绑定先执行

先捕获后冒泡
```js
target.addEventListener(type, listener, useCapture); // useCapture 为true则表示捕获阶段触发
// 或者
target.addEventListener(type, listener, { capture }); // captrue为true则表示捕获阶段触发
```

### stopPropagation VS stopImmediatePropagation
- stopImmediatePropagation不仅阻止事件向上冒泡，还阻止当前元素其余的事件监听器继续执行
- stopPropagation只会阻止向上冒泡

在下面的demo中，如果调用`e.stopPropagation()`，那么打印为：        
parent 捕获事件       
child 捕获事件       
child 冒泡事件 1       
child 冒泡事件 2       
child 冒泡事件 3       


如果调用`e.stopImmediatePropagation()`，那么打印为：       
parent 捕获事件       
child 捕获事件      
child 冒泡事件 1       
child 冒泡事件 2       

```html
<body>
  <div id="root">
    <div id="parent" >
      <button id="child">事件执行</button>
    </div>
  </div>
  <script>
    const root = document.getElementById('root')
    const parent = document.getElementById('parent')
    const child = document.getElementById('child')

    parent.addEventListener('click', e => {
      console.log('parent 冒泡事件')
    })
    parent.addEventListener('click', e => {
      console.log('parent 捕获事件')
    }, true)

    child.addEventListener('click', e => {
      console.log('child 冒泡事件 1')
    })
    child.addEventListener('click', e => {
      // e.stopPropagation()
    //   e.stopImmediatePropagation()
      console.log('child 冒泡事件 2')
    })
    child.addEventListener('click', e => {
      console.log('child 冒泡事件 3')
    })

    child.addEventListener('click', e => {
      console.log('child 捕获事件')
    }, true)
  </script>
</body>
```
### 事件委托(事件代理)
事件委托本质上就是将事件绑定到特定的容器上，而不用每个元素都绑定一次。

下面的demo中，使用`onClick`注册冒泡事件，`onClickCapture`注册捕获事件。为提高性能，节省内存，我们没有将这些事件各自绑定到`parent`元素或者`child`元素中，而是给它们添加一个`props`属性。

```html
<body>
  <div id="root">
    <div id="parent" >
      <button id="child">事件执行</button>
    </div>
  </div>
  <script>
    const root = document.getElementById('root')
    const parent = document.getElementById('parent')
    const child = document.getElementById('child')
    parent.props = {
      onClick: () => { console.log('parent 冒泡事件') },
      onClickCapture: () => { console.log('parent 捕获事件')}
    }
    child.props = {
      onClick: () => { console.log('child 冒泡事件') },
      onClickCapture: () => { console.log('child 捕获事件')}
    }
    // 在容器root的冒泡阶段注册代理事件，并在其中模拟捕获和冒泡阶段的事件执行顺序
    root.addEventListener('click', e => {
      const path = e.path
      // 先执行捕获阶段事件
      for(let i = path.length - 1; i >= 0; i-- ){
        const props = path[i].props || {}
        const handler = props.onClickCapture;
        handler && handler()
      }
      
      // 后冒泡阶段
      for(let i = 0; i < path.length; i++){
        const props = path[i].props || {}
        const handler = props.onClick;
        handler && handler()
      }
    })
  </script>
</body>
```
上面的例子是在容器`root`的冒泡阶段注册代理事件，如果元素绑定了原生的事件，那么`props`中的事件都在原生的事件(包括捕获和冒泡)执行完后才执行，比如下面的例子

```html
<body>
  <div id="root">
    <div id="parent" >
      <button id="child">事件执行</button>
    </div>
  </div>
  <script>
    const root = document.getElementById('root')
    const parent = document.getElementById('parent')
    const child = document.getElementById('child')
    parent.props = {
      onClick: () => { console.log('parent 冒泡事件') },
      onClickCapture: () => { console.log('parent 捕获事件')}
    }
    child.props = {
      onClick: () => { console.log('child 冒泡事件') },
      onClickCapture: () => { console.log('child 捕获事件')}
    }
    root.addEventListener('click', e => {
      const path = e.path
      // 先执行捕获阶段事件
      for(let i = path.length - 1; i >= 0; i-- ){
        const props = path[i].props || {}
        const handler = props.onClickCapture;
        handler && handler()
      }
      
      // 后冒泡阶段
      for(let i = 0; i < path.length; i++){
        const props = path[i].props || {}
        const handler = props.onClick;
        handler && handler()
      }
    })

    parent.addEventListener('click', () => {
      console.log('parent 原生 冒泡事件')
    })
    parent.addEventListener('click', () => {
      console.log('parent 原生 捕获事件')
    }, true)

    child.addEventListener('click', () => {
      console.log('child 原生 冒泡事件')
    })

    child.addEventListener('click', () => {
      console.log('child 原生 捕获事件')
    }, true)
  </script>
</body>
```

### props捕获和冒泡事件分开执行
在容器`root` 的冒泡阶段执行 `props` 的冒泡事件。在容器`root` 的捕获阶段执行 `props` 的捕获事件
```html
<body>
  <div id="root">
    <div id="parent" >
      <button id="child">事件执行</button>
    </div>
  </div>
  <script>
    const root = document.getElementById('root')
    const parent = document.getElementById('parent')
    const child = document.getElementById('child')
    parent.props = {
      onClick: () => { console.log('parent 冒泡事件') },
      onClickCapture: () => { console.log('parent 捕获事件')}
    }
    child.props = {
      onClick: () => { console.log('child 冒泡事件') },
      onClickCapture: () => { console.log('child 捕获事件')}
    }
    root.addEventListener('click', e => {
      const path = e.path
      for(let i = 0; i < path.length; i++){
        const props = path[i].props || {}
        const handler = props.onClick;
        handler && handler()
      }
    })

    root.addEventListener('click', e => {
      const path = e.path
      for(let i = path.length - 1; i >= 0; i-- ){
        const props = path[i].props || {}
        const handler = props.onClickCapture;
        handler && handler()
      }
    }, true)

    parent.addEventListener('click', () => {
      console.log('parent 原生 冒泡事件')
    })
    parent.addEventListener('click', () => {
      console.log('parent 原生 捕获事件')
    }, true)

    child.addEventListener('click', () => {
      console.log('child 原生 冒泡事件')
    })

    child.addEventListener('click', () => {
      console.log('child 原生 捕获事件')
    }, true)
  </script>
</body>
```