const ReactNoopUpdateQueue = {
    isMounted: function (publicInstance) {
        return false;
    },
    enqueueForceUpdate: function (publicInstance, callback, callerName) {
    },
    enqueueReplaceState: function (
        publicInstance,
        completeState,
        callback,
        callerName,
    ) { },
    enqueueSetState: function (
        publicInstance,
        partialState,
        callback,
        callerName,
    ) { },
};

export default ReactNoopUpdateQueue;
