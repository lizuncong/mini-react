> 本章是手写 React Scheduler 异步任务调度源码系列的第四篇文章，上一篇文章可以查看[【React Scheduler 源码第三篇】React Scheduler 原理及手写源码
> ](https://github.com/lizuncong/mini-react/blob/master/docs/schedule/%E6%89%8B%E5%86%99scheduler%E6%BA%90%E7%A0%81.md)。本章实现 scheduler 中任务优先级、延迟任务相关的源码

## 优先级

以我们平时需求排期为例，优先级高的需求优先开始，在开发的过程中，总是会有更高优先级的需求插队。那怎么衡量需求的优先级呢？一般来说，优先级高的需求都是需要尽快完成尽早上线。因此，高优先级的需求总是比低优先级的需求早点提测，即高优先级的提测日期（deadline）会更早一些。比如，今天(9 月 8 日)在给需求 A、B、C、D 排期时：

- D 的优先级比较高，2 天后提测，提测日期为 9 月 10 日
- 其次是 B，5 天后提测，提测日期为 9 月 13 日
- 然后是 C，10 天后提测，提测日期为 9 月 18 日
- 最后是 A，20 天后提测，提测日期为 9 月 28 日

这些需求在甘特图中，就会标明每个需求的开始日期，截止日期等信息，然后项目管理人员会按照需求优先级(提测的日期)排序，优先级高的先开始执行。在这个工程中，如果有新的优先级高的需求，比如 E 需要 9 月 15 日提测，那么项目管理人员需要重新排序，然后发现需求 E 需要在 C 之前，B 之后执行。

**同理，在 React 调度中，当我们通过 scheduleCallback 添加一个任务时，我们需要记录这个任务的开始时间，截止时间等信息，然后按照任务的截止时间排序，截止时间越小的，优先级越高，需要尽快执行。**

那截止时间该怎么算呢？我们是不是可以调度的时候传入这个任务的截止时间，比如

```js
scheduleCallback(new Date("2022-09-08 18:45: 34"), task);
```

这样是不是好傻？类比于需求排期，我们只需要将需求的过期时间表明，比如 2 天后过期，那截止日期不就是当前时间 + 2 天吗？同理，我们在调度任务时，只需要告诉 scheduler 这个任务多久过期，比如 200 毫秒，1000 毫秒，还是 50000 毫秒，就不需要开发者手动计算截止时间：

```js
scheduleCallback(1000ms, task);
scheduleCallback(200ms, task);
scheduleCallback(500ms, task);
scheduleCallback(600ms, task);
scheduleCallback(500ms, task);
```

由于传具体的值不够语义化，因此我们可以定义几个优先级的枚举，这些枚举值代表不同的过期时间，比如：

```js
// 以下过期时间单位都是毫秒
const maxSigned31BitInt = 1073741823; // 最大整数
const IMMEDIATE_PRIORITY_TIMEOUT = -1; // 过期时间-1毫秒，超高优先级，需要立即执行
const USER_BLOCKING_PRIORITY_TIMEOUT = 250; 
const NORMAL_PRIORITY_TIMEOUT = 5000;
const LOW_PRIORITY_TIMEOUT = 10000; 
const IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt; // 永不过期，最低优先级
```
