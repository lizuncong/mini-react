> 平时开发过程中我们会使用 try catch 捕获异常。如果不使用 try catch，我们希望在全局统一捕获异常并且统一处理，应该怎么做？

## try catch

try catch 只能捕获同步代码中的异常。

try catch 一个简单的例子如下，render 中的异常会被 catch 捕获到

```js
function render() {
  console.log(aa);
}
try {
  render();
} catch (e) {
  console.log("catch an error...", e);
}
```

try catch 不能捕获异步代码中的异常，比如 setTimeout 里面的

```js
function render() {
  console.log(aa);
}
try {
  setTimeout(() => {
    render(); // 不能被外面的try catch捕获
  }, 0);
} catch (e) {
  console.log("catch an error...", e);
}
```

如果需要捕获 setTimeout 里面的异常，只能将 try catch 移入 setTimeout 里面

## Promise 中的异常

Promise 中的异常可以通过 then 捕获

```js
function render() {
  console.log(aa);
}
new Promise((resolve, reject) => {
  render();
}).then(
  (res) => {
    console.log("res..", res);
  },
  (err) => {
    console.log("promise catch err..", err);
  }
);
```

或者通过 Promise.catch 捕获

```js
function render() {
  console.log(aa);
}
new Promise((resolve, reject) => {
  render();
})
  .then((res) => {
    console.log("res..", res);
  })
  .catch((e) => {
    console.log("promise.catch...", e);
  });
```

## window onerror

window onerror 事件会捕获那些未被捕获的异常。比如没有使用 try catch 捕获的异常，会被 window onerror 捕获。

比如，我们没有用 try catch 捕获 render 中的异常，因此它将会被全局的 onerror 捕获

```js
window.addEventListener("error", (e) => {
  console.log("全局捕获的异常...", e);
});
function render() {
  console.log(aa);
}
setTimeout(() => {
  render();
}, 0);
```

下面的例子由于使用了 try catch 捕获异常，因此不会被全局的 onerror 捕获。

```js
window.addEventListener("error", (e) => {
  console.log("全局捕获的异常...", e);
});
function render() {
  console.log(aa);
}
setTimeout(() => {
  try {
    render();
  } catch (e) {
    console.log("set time out 捕获的异常", e);
  }
}, 0);
```

**onerror 并不会捕获 promise 抛出的异常，我们可以使用 onunhandledrejection 捕获 promise 抛出的异常**

## window onunhandledrejection

一般情况下，我们可以直接使用 Promsie 的 then 或者 promise.catch 捕获 Promise 的异常。但是如果我们希望在全局捕获 Promise 抛出的异常，可以使用 onunhandledrejection

```js
window.addEventListener("unhandledrejection", (e) => {
  console.log("全局的onunhandledrejection捕获的异常...", e);
});
function render() {
  console.log(aa);
}

new Promise((resolve, reject) => {
  render();
  resolve();
});
```

## 小结

window.onerror 和 window.onunhandledrejection 都是只会捕获那些未被捕获的全局异常

## 如何利用谷歌 devtool 在异常代码处打断点？

### Pause on exceptions

比如下面的代码

```js
useLayoutEffect(() => {
  console.log(aaadd);
}, []);
```

这个异常我们并没有使用 try catch 捕获，因此如果我们勾上 `Pause on exceptions`，那么浏览器会自动定位到抛出异常的位置，即 console.log(aaadd)这里

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/devtool-01.jpg)

使用 `window.onerror` 全局捕获的异常，`Pause on exceptions`还是起作用的。
比如，我们在 `index.html`中注册一个全局的异常捕获监听器

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Mini React</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <div id="root"></div>
    <script>
      window.addEventListener("error", (e) => {
        console.log("全局捕获的异常888...", e);
      });
    </script>
  </body>
</html>
```

```js
useLayoutEffect(() => {
  console.log(aaadd);
}, []);
```

即使异常被全局捕获了，`Pause on exceptions`仍然会自动定位到抛出异常的位置

而下面的代码中，由于我们使用了 try catch 捕获了异常，因此 `Pause on exceptions` 不会自动定位到抛出异常的位置，但是我们可以使用 `Pause On Caught Exceptions`

```js
useLayoutEffect(() => {
  try {
    console.log(aaadd);
  } catch (e) {
    console.log("捕获异常...", e);
  }
}, []);
```

### Pause On Caught Exceptions

定位到抛出异常的代码位置，只能定位到那些被捕获的异常的位置，比如

```js
useLayoutEffect(() => {
  try {
    console.log(aaadd);
  } catch (e) {
    console.log("捕获异常...", e);
  }
}, []);
```

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/devtool-02.jpg)
