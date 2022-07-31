> dispatchEvent 用于向一个指定的事件目标派发一个事件(自定义事件), 并以合适的顺序**同步调用**目标元素相关的事件处理函数。使用`Event`构造函数创建自定义事件

## dispatchEvent

通过 MDN 上对[dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)的描述，可以得出以下几点结论：

- 1. 浏览器原生的 DOM 事件是由 DOM 派发的，并通过 event loop 异步调用事件处理程序。
- 2. **dispatchEvent()则是同步调用事件处理程序。在调用 dispatchEvent()后，所有监听该事件的事件处理程序将在代码继续前执行并返回。**
- 3. **这些 event handlers 运行在一个嵌套的调用栈中： 他们会阻塞调用直到他们处理完毕，但是异常不会冒泡**

第一点很容易理解，下面我们通过例子来了解下第 2 点和第 3 点

## 同步调用事件处理程序是什么意思？

通过`document.createEvent`创建自定义事件的方式已经被废弃，我们应该改用`Event`构造函数的方式

看下面的例子

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>dispatchEvent</title>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
    />
  </head>

  <body>
    <div id="root">
      <button id="btn">click me</button>
    </div>
    <script>
      const event = new Event("MyCustomEvent");
      btn.addEventListener("MyCustomEvent", function (e) {
        console.log("btn监听自定义事件-1", e);
      });
      btn.addEventListener("MyCustomEvent", function (e) {
        console.log("btn..监听自定义事件-2", e);
      });
      console.log("开始触发自定义事件");
      btn.dispatchEvent(event);
      console.log("自定义事件监听函数执行完毕");
    </script>
  </body>
</html>
```

通过`addEventListener`在`btn`上注册了两个自定义事件监听器。然后通过`btn.dispatchEvent(event);`手动触发。可以看到事件监听器按照注册的顺序同步执行！如下图所示

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/custom-event-01.jpg)

### 自定义事件冒泡

只需要在初始化`Event`时传入参数`{ bubbles: true }` 即可

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>dispatchEvent</title>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
    />
  </head>

  <body>
    <div id="root">
      <button id="btn">click me</button>
    </div>
    <script>
      const event = new Event("MyCustomEvent", { bubbles: true });
      root.addEventListener("MyCustomEvent", function (e) {
        console.log("root..监听自定义事件-1", e);
      });
      btn.addEventListener("MyCustomEvent", function (e) {
        console.log("btn..监听自定义事件-1", e);
      });
      btn.addEventListener("MyCustomEvent", function (e) {
        console.log("btn..监听自定义事件-2", e);
      });
      root.addEventListener("MyCustomEvent", function (e) {
        console.log("root..监听自定义事件-2", e);
      });
      console.log("开始触发自定义事件");
      btn.dispatchEvent(event);
      console.log("自定义事件监听函数执行完毕");
    </script>
  </body>
</html>
```

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/custom-event-02.jpg)

## 如果自定义事件监听器抛出异常，会怎样？

首先我们在全局注册一个异常捕获监听器：

```js
window.onerror = (e) => {
  console.log("全局捕获异常...", e);
};
```

然后在`btn`的事件监听器中抛出异常

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>dispatchEvent</title>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
    />
  </head>

  <body>
    <div id="root">
      <button id="btn">click me</button>
    </div>
    <script>
      window.onerror = (e) => {
        console.log("全局捕获异常...", e);
      };
      const event = new Event("MyCustomEvent", { bubbles: true });
      root.addEventListener("MyCustomEvent", function (e) {
        console.log("root..监听自定义事件-1", e);
      });
      btn.addEventListener("MyCustomEvent", function (e) {
        console.log("btn..监听自定义事件-1", e);
        throw Error("btn事件监听器抛出的异常");
        console.log("btn异常后面的代码不会执行");
      });
      btn.addEventListener("MyCustomEvent", function (e) {
        console.log("btn..监听自定义事件-2", e);
      });
      root.addEventListener("MyCustomEvent", function (e) {
        console.log("root..监听自定义事件-2", e);
      });
      console.log("开始触发自定义事件");
      btn.dispatchEvent(event);
      console.log("自定义事件监听函数执行完毕");
    </script>
  </body>
</html>
```

可以看出，自定义事件监听器中的异常只会终止自身的执行，而不会影响到其他事件监听器的执行。

**注意！！！btn 的第一个监听器中抛出的异常，会立即被全局异常捕获监听器捕获到，并且立即执行，全局异常监听器执行完成后，才接着执行 btn 的第 2 个监听器...**
![image](https://github.com/lizuncong/mini-react/blob/master/imgs/custom-event-03.jpg)
