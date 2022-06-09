// UpdateQueue is a linked list of prioritized updates.
//
// Like fibers, update queues come in pairs: a current queue, which represents
// the visible state of the screen, and a work-in-progress queue, which can be
// mutated and processed asynchronously before it is committed — a form of
// double buffering. If a work-in-progress render is discarded before finishing,
// we create a new work-in-progress by cloning the current queue.
//
// Both queues share a persistent, singly-linked list structure. To schedule an
// update, we append it to the end of both queues. Each queue maintains a
// pointer to first update in the persistent list that hasn't been processed.
// The work-in-progress pointer always has a position equal to or greater than
// the current queue, since we always work on that one. The current queue's
// pointer is only updated during the commit phase, when we swap in the
// work-in-progress.
//
// For example:
//
//   Current pointer:           A - B - C - D - E - F
//   Work-in-progress pointer:              D - E - F
//                                          ^
//                                          The work-in-progress queue has
//                                          processed more updates than current.
//
// The reason we append to both queues is because otherwise we might drop
// updates without ever processing them. For example, if we only add updates to
// the work-in-progress queue, some updates could be lost whenever a work-in
// -progress render restarts by cloning from current. Similarly, if we only add
// updates to the current queue, the updates will be lost whenever an already
// in-progress queue commits and swaps with the current queue. However, by
// adding to both queues, we guarantee that the update will be part of the next
// work-in-progress. (And because the work-in-progress queue becomes the
// current queue once it commits, there's no danger of applying the same
// update twice.)
//
// Prioritization
// --------------
//
// Updates are not sorted by priority, but by insertion; new updates are always
// appended to the end of the list.
//
// The priority is still important, though. When processing the update queue
// during the render phase, only the updates with sufficient priority are
// included in the result. If we skip an update because it has insufficient
// priority, it remains in the queue to be processed later, during a lower
// priority render. Crucially, all updates subsequent to a skipped update also
// remain in the queue *regardless of their priority*. That means high priority
// updates are sometimes processed twice, at two separate priorities. We also
// keep track of a base state, that represents the state before the first
// update in the queue is applied.
//
// For example:
//
//   Given a base state of '', and the following queue of updates
//
//     A1 - B2 - C1 - D2
//
//   where the number indicates the priority, and the update is applied to the
//   previous state by appending a letter, React will process these updates as
//   two separate renders, one per distinct priority level:
//
//   First render, at priority 1:
//     Base state: ''
//     Updates: [A1, C1]
//     Result state: 'AC'
//
//   Second render, at priority 2:
//     Base state: 'A'            <-  The base state does not include C1,
//                                    because B2 was skipped.
//     Updates: [B2, C1, D2]      <-  C1 was rebased on top of B2
//     Result state: 'ABCD'
//
// Because we process updates in insertion order, and rebase high priority
// updates when preceding updates are skipped, the final result is deterministic
// regardless of priority. Intermediate state may vary according to system
// resources, but the final state is always the same.

// 以上注释摘抄自 react 源码源文件，需要仔细品味



export const UpdateState = 0;
export const ReplaceState = 1;
export const ForceUpdate = 2;
export const CaptureUpdate = 3;


export function initializeUpdateQueue(fiber) {
    const queue = {
        baseState: fiber.memoizedState,
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        shared: {
            pending: null
        },
        effects: null
    };
    fiber.updateQueue = queue;
}

export function cloneUpdateQueue(current, workInProgress) {
    // Clone the update queue from current. Unless it's already a clone.
    const queue = workInProgress.updateQueue;
    const currentQueue = current.updateQueue;

    if (queue === currentQueue) {
        const clone = {
            baseState: currentQueue.baseState,
            firstBaseUpdate: currentQueue.firstBaseUpdate,
            lastBaseUpdate: currentQueue.lastBaseUpdate,
            shared: currentQueue.shared,
            effects: currentQueue.effects
        };
        workInProgress.updateQueue = clone;
    }
}

export function createUpdate(eventTime, lane) {
    const update = {
        eventTime: eventTime,
        lane: lane,
        tag: UpdateState,
        payload: null,
        callback: null,
        next: null
    };
    return update;
}

export function enqueueUpdate(fiber, update) {
    const updateQueue = fiber.updateQueue;

    if (updateQueue === null) {
        // Only occurs if the fiber has been unmounted.
        return;
    }

    const sharedQueue = updateQueue.shared;
    const pending = sharedQueue.pending;

    if (pending === null) {
        // This is the first update. Create a circular list.
        update.next = update;
    } else {
        update.next = pending.next;
        pending.next = update;
    }

    sharedQueue.pending = update;
}


// TODO processUpdateQueue需要细品
export function processUpdateQueue(workInProgress, props, instance, renderLanes) {
    const queue = workInProgress.updateQueue;
    let firstBaseUpdate = queue.firstBaseUpdate
    let lastBaseUpdate = queue.lastBaseUpdate
    const pendingQueue = queue.shared.pending;
    if (pendingQueue !== null) {
        queue.shared.pending = null; // 新旧节点的pending指针都被重置成了null
        const lastPendingUpdate = pendingQueue;
        const firstPendingUpdate = lastPendingUpdate.next;
        lastPendingUpdate.next = null; // Append pending updates to base queue

        if (lastBaseUpdate === null) {
            firstBaseUpdate = firstPendingUpdate;
        } else {
            lastBaseUpdate.next = firstPendingUpdate;
        }

        lastBaseUpdate = lastPendingUpdate;
        const current = workInProgress.alternate;

        if (current !== null) {
            // This is always non-null on a ClassComponent or HostRoot
            const currentQueue = current.updateQueue;
            const currentLastBaseUpdate = currentQueue.lastBaseUpdate;

            if (currentLastBaseUpdate !== lastBaseUpdate) {
                if (currentLastBaseUpdate === null) {
                    currentQueue.firstBaseUpdate = firstPendingUpdate;
                } else {
                    currentLastBaseUpdate.next = firstPendingUpdate;
                }

                currentQueue.lastBaseUpdate = lastPendingUpdate;
            }
        }
    }

    if (firstBaseUpdate !== null) {
        // Iterate through the list of updates to compute the result.
        let newState = queue.baseState;
        let newBaseState = null;
        let newFirstBaseUpdate = null;
        let newLastBaseUpdate = null;
        let update = firstBaseUpdate;

        do {
            const _payload = update.payload;
            let partialState;
            if (typeof _payload === 'function') {
                partialState = _payload.call(instance, newState, props);
            } else {
                // Partial state object
                partialState = _payload;
            }
            if (partialState !== null && partialState !== undefined) {
                // Null and undefined are treated as no-ops.
                newState = { ...newState, ...partialState };
            }

            update = update.next;
        } while (update);

        if (newLastBaseUpdate === null) {
            newBaseState = newState;
        }

        queue.baseState = newBaseState;
        queue.firstBaseUpdate = newFirstBaseUpdate;
        queue.lastBaseUpdate = newLastBaseUpdate;
        workInProgress.memoizedState = newState;
    }
}


export function commitUpdateQueue(finishedWork, finishedQueue, instance) {
    // Commit the effects
    const effects = finishedQueue.effects;
    finishedQueue.effects = null;

    if (effects !== null) {
        for (var i = 0; i < effects.length; i++) {
            var effect = effects[i];
            var callback = effect.callback;

            if (callback !== null) {
                effect.callback = null;
                // callCallback(callback, instance);
            }
        }
    }
}