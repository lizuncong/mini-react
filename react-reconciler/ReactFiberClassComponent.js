import { get, set } from '@shared/REactInstanceMap'
import { createUpdate, enqueueUpdate, cloneUpdateQueue, initializeUpdateQueue, processUpdateQueue } from './ReactUpdateQueue'
import { scheduleUpdateOnFiber } from './ReactFiberWorkLoop'
import { Update } from './ReactFiberFlags'
const classComponentUpdater = {
    enqueueSetState: function (inst, payload, callback) {
        const fiber = get(inst);
        const eventTime = performance.now(); //  requestEventTime();
        const lane = 1; // requestUpdateLane(fiber);
        const update = createUpdate(eventTime, lane);
        update.payload = payload;

        if (callback !== undefined && callback !== null) {
            update.callback = callback;
        }
        enqueueUpdate(fiber, update);
        scheduleUpdateOnFiber(fiber, lane, eventTime);
    },
}
export function mountClassInstance(workInProgress, ctor, newProps, renderLanes) {
    const instance = workInProgress.stateNode;
    instance.props = newProps;
    instance.state = workInProgress.memoizedState;
    initializeUpdateQueue(workInProgress)
    processUpdateQueue(workInProgress, newProps, instance, renderLanes);
    instance.state = workInProgress.memoizedState;
    const getDerivedStateFromProps = ctor.getDerivedStateFromProps;

    if (typeof getDerivedStateFromProps === 'function') {
        // applyDerivedStateFromProps(workInProgress, ctor, getDerivedStateFromProps, newProps);
        // instance.state = workInProgress.memoizedState;
    }

    // In order to support react-lifecycles-compat polyfilled components,
    // Unsafe lifecycles should not be invoked for components using the new APIs.
    if (typeof ctor.getDerivedStateFromProps !== 'function' && typeof instance.getSnapshotBeforeUpdate !== 'function' && (typeof instance.UNSAFE_componentWillMount === 'function' || typeof instance.componentWillMount === 'function')) {
        // callComponentWillMount(workInProgress, instance); // If we had additional state updates during this life-cycle, let's
        // // process them now.

        // processUpdateQueue(workInProgress, newProps, instance, renderLanes);
        // instance.state = workInProgress.memoizedState;
    }

    if (typeof instance.componentDidMount === 'function') {
        workInProgress.flags |= Update;
    }
}
function adoptClassInstance(workInProgress, instance) {
    instance.updater = classComponentUpdater;
    workInProgress.stateNode = instance;

    // The instance needs access to the fiber so that it can schedule updates
    set(instance, workInProgress);
}
export function constructClassInstance(workInProgress, ctor, props) {
    const context = {};
    const instance = new ctor(props, context);
    const state = workInProgress.memoizedState = instance.state !== null && instance.state !== undefined ? instance.state : null;
    adoptClassInstance(workInProgress, instance)
    return instance
}

export function updateClassInstance(current, workInProgress, ctor, newProps, renderLanes) {
    const instance = workInProgress.stateNode
    cloneUpdateQueue(current, workInProgress)
    const oldProps = workInProgress.memoizedProps
    instance.props = oldProps
    let oldState = workInProgress.memoizedState;
    let newState = instance.state = oldState;
    processUpdateQueue(workInProgress, newProps, instance, renderLanes);
    newState = workInProgress.memoizedState;
    if (typeof instance.componentDidUpdate === 'function') {
        workInProgress.flags |= Update;
    }
    instance.props = newProps;
    instance.state = newState;
    return true;
}