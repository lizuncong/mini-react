function beginWork(current, workInProgress, renderLanes) {
    switch (workInProgress.tag) {
        case IndeterminateComponent:
            {
                return mountIndeterminateComponent(current, workInProgress, workInProgress.type, renderLanes);
            }
        case FunctionComponent:
            {
                var _Component = workInProgress.type;
                var unresolvedProps = workInProgress.pendingProps;
                var resolvedProps = workInProgress.elementType === _Component ? unresolvedProps : resolveDefaultProps(_Component, unresolvedProps);
                return updateFunctionComponent(current, workInProgress, _Component, resolvedProps, renderLanes);
            }
        case ClassComponent:
            {
                var _Component2 = workInProgress.type;
                var _unresolvedProps = workInProgress.pendingProps;

                var _resolvedProps = workInProgress.elementType === _Component2 ? _unresolvedProps : resolveDefaultProps(_Component2, _unresolvedProps);

                return updateClassComponent(current, workInProgress, _Component2, _resolvedProps, renderLanes);
            }

        case HostRoot:
            return updateHostRoot(current, workInProgress, renderLanes);

        case HostComponent:
            return updateHostComponent(current, workInProgress, renderLanes);

        case HostText:
            return updateHostText(current, workInProgress);

    }
}

function updateHostComponent(current, workInProgress, renderLanes) {

    if (current === null) {
        tryToClaimNextHydratableInstance(workInProgress);
    }

    reconcileChildren(current, workInProgress, nextChildren, renderLanes);
    return workInProgress.child;
}

function tryToClaimNextHydratableInstance(fiber) {
    if (!isHydrating) {
        return;
    }

    var nextInstance = nextHydratableInstance;

    if (!nextInstance) {
        // Nothing to hydrate. Make it an insertion.
        insertNonHydratedInstance(hydrationParentFiber, fiber);
        isHydrating = false;
        hydrationParentFiber = fiber;
        return;
    }

    var firstAttemptedInstance = nextInstance;

    if (!tryHydrate(fiber, nextInstance)) {
        // If we can't hydrate this instance let's try the next one.
        // We use this as a heuristic. It's based on intuition and not data so it
        // might be flawed or unnecessary.
        nextInstance = getNextHydratableSibling(firstAttemptedInstance);

        if (!nextInstance || !tryHydrate(fiber, nextInstance)) {
            // Nothing to hydrate. Make it an insertion.
            insertNonHydratedInstance(hydrationParentFiber, fiber);
            isHydrating = false;
            hydrationParentFiber = fiber;
            return;
        } // We matched the next one, we'll now assume that the first one was
        // superfluous and we'll delete it. Since we can't eagerly delete it
        // we'll have to schedule a deletion. To do that, this node needs a dummy
        // fiber associated with it.


        deleteHydratableInstance(hydrationParentFiber, firstAttemptedInstance);
    }

    hydrationParentFiber = fiber;
    nextHydratableInstance = getFirstHydratableChild(nextInstance);
}