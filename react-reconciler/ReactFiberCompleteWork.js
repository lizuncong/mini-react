import { HostComponent } from './ReactWorkTags'
function completeWork(current, workInProgress, renderLanes) {
    const newProps = workInProgress.pendingProps;
    switch (workInProgress.tag) {
        case HostComponent:
            if (current && workInProgress.stateNode) {
                updateHostComponent(
                    current,
                    workInProgress,
                    workInProgress.tag,
                    newProps
                );
            } else {
                // 没有current说明是第一次渲染
                // 创建真实的DOM节点
                const type = workInProgress.type;
                const instance = createInstance(type, newProps); // 创建真实dom
                appendAllChildren(instance, workInProgress);
                workInProgress.stateNode = instance;
                // 给真实dom添加属性
                finalizeInitialChildren(instance, type, newProps);
            }
            break;
    }
    console.log('ReactFiberCompleteWork.js tag不存在  completeWork：', workInProgress.tag)
};