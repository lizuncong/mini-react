### React面试题
- 为什么不能在条件和循环里使用Hooks
- 为什么不能在函数组件外部使用Hooks
- React Hooks的状态保存在了哪里
- 为什么传入二次相同的状态，函数组件不更新
- 函数组件的useState和类组件的setState有什么区别

### 循环列表
在组件更新时会用到
```js
function dispatchAction(queue, action){
    const update = { action, next: null }
    const pending = queue.pending;
    if(pending === null){
        update.next = update
    } else {
        update.next = pending.next;
        pending.next = update;
    }
    queue.pending = update
}

// 队列
const queue = { pending: null } // queue.pending永远指向最后一个更新
dispatchAction(queue, 'action1')
dispatchAction(queue, 'action2')
dispatchAction(queue, 'action3')

const pendingQueue = queue.pending
if(pendingQueue != null){
    const first = pendingQueue.next; // 第一个节点
    let update = first
    do{
        console.log(update)
        update = update.next
    }while(update !== first)
}
``` 

### 使用useReducer
#### renderWithHooks
 ![image](https://github.com/lizuncong/mini-react/blob/master/imgs/useReducer-01.jpg)

#### hooks更新
 ![image](https://github.com/lizuncong/mini-react/blob/master/imgs/useReducer-02.jpg)
