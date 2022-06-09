import { HostComponent, FunctionComponent, ClassComponent, HostText, HostRoot } from './ReactWorkTags'
import { Snapshot } from './ReactFiberFlags'
import { createInstance, appendInitialChild, finalizeInitialChildren, createTextInstance } from '@react-dom/client/ReactDOMHostConfig'


function updateHostContainer(workInProgress) {// Noop
};
function appendAllChildren(parent, workInProgress, needsVisibilityToggle, isHidden) {
    let node = workInProgress.child;
    while (node !== null) {
        if (node.tag === HostComponent || node.tag === HostText) {
            // 这一步有dom操作，将文本节点添加到父节点中
            appendInitialChild(parent, node.stateNode);
        }
        if (node === workInProgress) {
            return
        }
        while (node.sibling === null) {
            if (node.return === null || node.return === workInProgress) {
                return;
            }
            node = node.return;
        }
        // 每个fiber节点都有一个return指针指向父节点，这里为啥还多此一举？？
        node.sibling.return = node.return;
        node = node.sibling;
    }
}

export function completeWork(current, workInProgress, renderLanes) {
    const newProps = workInProgress.pendingProps;
    switch (workInProgress.tag) {
        case FunctionComponent:
            return null
        case ClassComponent:
            const Component = workInProgress.type;
            // if (isContextProvider(Component)) {
            //     popContext();
            // }
            return null;
        case HostRoot: 
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
        case HostComponent:
            const type = workInProgress.type;
            if (current && workInProgress.stateNode) {
                updateHostComponent(
                    current,
                    workInProgress,
                    workInProgress.tag,
                    newProps
                );
            } else {
                // 第一次渲染，创建真实的DOM节点
                const instance = createInstance(type, newProps, null, null, workInProgress);
                // 将子元素对应的dom节点添加到instance中，即instance.appendChild(chid)
                appendAllChildren(instance, workInProgress, false, false);
                workInProgress.stateNode = instance;
                // 给真实dom实例添加属性，比如style等
                finalizeInitialChildren(instance, type, newProps);
            }
            return null
        case HostText:
            const newText = newProps;
            workInProgress.stateNode = createTextInstance(newText, null, null, workInProgress);
            return null
    }
    console.log('ReactFiberCompleteWork.js tag不存在  completeWork：', workInProgress.tag)
};


function updateHostComponent(current, workInProgress, tag, newProps) {
    const oldProps = current.memoizedProps;
    const instance = workInProgress.stateNode;
    const updatePayload = prepareUpdate(instance, tag, oldProps, newProps); // [key1, value1, key2, value2]
    // 这里要注意updateQueue的差别
    // 在容器节点的fiber中，即 hostRootFiber.updateQueue 是一个环状链表：{ payload: element}
    // 在原生的html标签中，比如div，span，对应的fiber节点，他们的updateQueue是一个数组：updatePayload
    // 在类组件中，类组件对应的fiber节点，updateQueue保存的是更新队列，也是一个环状链表
    workInProgress.updateQueue = updatePayload;
    if (updatePayload) {
        workInProgress.flags |= Update;
    }
}