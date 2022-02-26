
/**
 * 初始化更新队列，更新队列其实就是一个环状列表
 * 所有的fiber都会将待更新内容放在更新队列中
 * */ 
export function initializeUpdateQueue(fiber){
    const queue = {
        shared: {
            pending: null
        }
    }

    fiber.updateQueue = queue
}


function createUpdate(){
    return {}
}

/**
 * 向当前的fiber的更新队列中添加一个更新
*/

function enqueueUpdate(fiber, update){
    const updateQueue = fiber.updateQueue
    const sharedQueue = updateQueue.shared
    const pending = sharedQueue.pending
    if(!pending){
        update.next = update
    }
    sharedQueue.pending = update
}

// 案例，假设：
const fiber = { baseState: { number: 0 } }

initializeUpdateQueue(fiber)
const update1 = createUpdate()
update1.payload = { number: 1 }
enqueueUpdate(fiber, update1)

const update2 = createUpdate()
update2.payload = { number: 2 }
enqueueUpdate(fiber, update2)