> 本章是手写 React Scheduler 源码系列的第三篇文章，前两篇可以点击下面链接查看：1.[哪些 API 适合用于任务调度](./%E5%93%AA%E4%BA%9BAPI%E9%80%82%E5%90%88%E7%94%A8%E4%BA%8E%E4%BB%BB%E5%8A%A1%E8%B0%83%E5%BA%A6.md)。2.[scheduler 用法详解](./scheduler%E7%94%A8%E6%B3%95%E8%AF%A6%E8%A7%A3.md)

## 前置基础知识

如果对 `requestAnimationFrame`、`requestIdleCallback`、`setTimeout`、`MessageChannel`、`MutationObserver`、`Promise`等 API 还不熟悉的，可以先看[这篇文章](./%E5%93%AA%E4%BA%9BAPI%E9%80%82%E5%90%88%E7%94%A8%E4%BA%8E%E4%BB%BB%E5%8A%A1%E8%B0%83%E5%BA%A6.md)熟悉一下。如果对 React Scheduler 用法还不熟悉的，可以先看[这篇文章](./scheduler%E7%94%A8%E6%B3%95%E8%AF%A6%E8%A7%A3.md)熟悉一下

## 一个简单的动画

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>schedule源码</title>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
    />
    <style>
      #animation {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100px;
        height: 100px;
        background: red;
        animation: myfirst 5s;
        animation-iteration-count: infinite;
      }

      @keyframes myfirst {
        from {
          width: 30px;
          height: 30px;
          border-radius: 0;
          background: red;
        }
        to {
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: yellow;
        }
      }
    </style>
  </head>

  <body>
    <button id="btn">perform work</button>
    <div id="animation">Animation</div>
    <script></script>
  </body>
</html>
```

效果如下：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-01.jpg)

就是这么简单

## 点击按钮更新页面

给定一组任务，点击按钮的时候，全部执行完这组任务，然后将执行耗时更新到页面。很快我们就可以实现如下

```js
let works = [];
for (let i = 0; i < 3000; i++) {
  works.push(() => {
    const start = new Date().getTime();
    while (new Date().getTime() - start < 2) {}
  });
}
const btn = document.getElementById("btn");
const animate = document.getElementById("animation");
btn.onclick = () => {
  const startTime = new Date().getTime();
  flushWork();
  const endTime = new Date().getTime();
  animate.innerHTML = endTime - startTime;
};

function flushWork() {
  works.forEach((w) => w());
}
```

效果如下：

![image](https://github.com/lizuncong/mini-react/blob/master/imgs/schedule-02.jpg)

> 【问题分析】：这里有个问题，点击按钮后，经过 6 秒后页面才更新，同时动画停止，页面卡顿响应不了用户输入，此时继续点击按钮是没任何反应的。因此，虽然说是实现了效果，但是交互体验不够友好。

##
