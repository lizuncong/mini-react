import { HostComponent } from "./ReactWorkTags";
import {
  createInstance,
  finalizeInitialChildren,
  prepareUpdate,
} from "./ReactDOMHostConfig";
import { Update } from "./ReactFiberFlags";

export const completeWork = (current, workInProgress) => {
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
        // 创建真实的DOM节点
        const type = workInProgress.type;
        const instance = createInstance(type, newProps); // 创建真实dom
        workInProgress.stateNode = instance;
        // 给真实dom添加属性
        finalizeInitialChildren(instance, type, newProps);
      }
      break;
    default:
      break;
  }
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
