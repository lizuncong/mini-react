> react scheduler 是 react 提供的一个可以独立使用的包。如果想要熟悉 sheduler 源码，需要先了解用法，本节将详细介绍 scheduler 的基本用法

## 准备工作

新建 html 文件：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>schedule用法</title>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
    />
    <script src="./schedule.js"></script>
  </head>

  <body>
    <div id="animation">
      <div>Scheduler</div>
    </div>
    <script>
      function printA() {
        const start = new Date().getTime();
        while (new Date().getTime() - start < 7) {}
        console.log("A");
      }
      function printB() {
        const start = new Date().getTime();
        while (new Date().getTime() - start < 3) {}
        console.log("B");
      }
      function printC() {
        const start = new Date().getTime();
        while (new Date().getTime() - start < 4) {}
        console.log("C");
      }
      function printD() {
        const start = new Date().getTime();
        while (new Date().getTime() - start < 7) {}
        console.log("D");
      }
      function printE() {
        const start = new Date().getTime();
        while (new Date().getTime() - start < 10) {}
        console.log("E");
      }
    </script>
  </body>
</html>
```

[schedule.js](./schedule.js)文件可以在[这里](./schedule.js)获取

### 相同优先级

```js
unstable_scheduleCallback(NormalPriority, printA);
unstable_scheduleCallback(NormalPriority, printB);
unstable_scheduleCallback(NormalPriority, printC);
unstable_scheduleCallback(NormalPriority, printD);
unstable_scheduleCallback(NormalPriority, printE);
```

可以看到，控制台依次按顺序输出：A、B、C、D、E
