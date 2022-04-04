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