
/**
 * 初始化更新队列，更新队列其实就是一个环状列表
 * 所有的fiber都会将待更新内容放在更新队列中
 * */
export function initializeUpdateQueue(fiber) {
    const queue = {
        shared: {
            pending: null
        }
    }

    fiber.updateQueue = queue
}


export function createUpdate() {
    return {}
}

/**
 * 向当前的fiber的更新队列中添加一个更新
*/

export function enqueueUpdate(fiber, update) {
    const updateQueue = fiber.updateQueue
    const sharedQueue = updateQueue.shared
    // pending永远指向最新的更新，最新的更新的next又指向第一个更新，
    // 因此pending.next永远指向第一个更新
    const pending = sharedQueue.pending
    if (!pending) {
        update.next = update
    } else {
        update.next = pending.next
        pending.next = update
    }
    sharedQueue.pending = update
}

// 案例，假设：
// const fiber = { baseState: { number: 0 } }

// initializeUpdateQueue(fiber)
// const update1 = createUpdate()
// update1.payload = { number: 1 }
// enqueueUpdate(fiber, update1)

// // update1.next指向update2，update2.next指向update1，然后pending指向update2
// // 达到一个环状的目的
// const update2 = createUpdate()
// update2.payload = { number: 2 }
// enqueueUpdate(fiber, update2)

// TODO: 需要删除