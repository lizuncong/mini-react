import { HostComponent, ClassComponent, HostRoot } from './ReactWorkTags'
import { Snapshot } from './ReactFiberFlags'
import { createInstance, finalizeInitialChildren } from '@react-dom/client/ReactDOMHostConfig'


function updateHostContainer(workInProgress) {// Noop
};
function appendAllChildren(parent, workInProgress, needsVisibilityToggle, isHidden) {
    let node = workInProgress.child;
    while (node) {
        // if (node.tag === HostComponent) {
        //     appendChild(parent, node.stateNode);
        // }
        // node = node.sibling;
    }
}

export function completeWork(current, workInProgress, renderLanes) {
    const newProps = workInProgress.pendingProps;
    switch (workInProgress.tag) {
        case ClassComponent:
            {
                const Component = workInProgress.type;
                // if (isContextProvider(Component)) {
                //     popContext();
                // }
                return null;
            }
        case HostRoot:
            {
                const fiberRoot = workInProgress.stateNode;
                if (current === null || current.child === null) {
                    // Schedule an effect to clear this container at the start of the next commit.
                    // This handles the case of React rendering into a container with previous children.
                    // It's also safe to do for updates too, because current.child would only be null
                    // if the previous render was null (so the the container would already be empty).
                    workInProgress.flags |= Snapshot;
                }

                updateHostContainer(workInProgress);
                return null;
            }
        case HostComponent:
            const type = workInProgress.type;
            if (current && workInProgress.stateNode) {
                // updateHostComponent(
                //     current,
                //     workInProgress,
                //     workInProgress.tag,
                //     newProps
                // );
            } else {
                // 第一次渲染，创建真实的DOM节点
                const instance = createInstance(type, newProps);
                appendAllChildren(instance, workInProgress, false, false);
                workInProgress.stateNode = instance;
                // 给真实dom添加属性
                finalizeInitialChildren(instance, type, newProps);
            }
            return null
    }
    console.log('ReactFiberCompleteWork.js tag不存在  completeWork：', workInProgress.tag)
};