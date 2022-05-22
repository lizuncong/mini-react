import { createWorkInProgress } from "./ReactFiber";
import { beginWork } from "./ReactFiberBeginWork";
import { Placement, Update, Deletion } from "./ReactFiberFlags";
import { completeWork } from "./ReactFiberCompleteWork";
import {
  commitPlacement,
  commitWork,
  commitDeletion,
} from "../react-reconciler/ReactFiberCommitWork";
let workInProgressRoot = null; // 当前正在更新的根
let workInProgress = null; // 当前正在更新的fiber节点

/**
 * 这个方法非常重要
 * 不管如何更新，不管谁来更新，都会调度到这个方法里
 */
export const scheduleUpdateOnFiber = (fiber) => {
  //markUpdateLaneFromFiberToRoot方法的主要目的，不管在fiber树哪个节点触发的更新，都可以往上找到
  // fiber树的根节点，然后从根节点开始调度
  const fiberRoot = markUpdateLaneFromFiberToRoot(fiber);
  performSyncWorkOnRoot(fiberRoot);
};
function performSyncWorkOnRoot(fiberRoot) {
  workInProgressRoot = fiberRoot;
  // 根据老的fiber树和更新对象创建新的fiber树，然后根据新的fiber树更新真实DOM
  workInProgress = createWorkInProgress(workInProgressRoot.current);

  workLoopSync(); // 开启工作循环

  commitRoot();
}

function commitRoot() {
  const finishedWork = workInProgressRoot.current.alternate;
  workInProgressRoot.finishedWork = finishedWork;
  commitMutationEffects(workInProgressRoot);
}

function commitMutationEffects(root) {
  const finishedWork = root.finishedWork;
  let nextEffect = finishedWork.firstEffect;
  let effectList = "";
  while (nextEffect) {
    effectList += `(${nextEffect.flags}#${nextEffect.type}#${nextEffect.key})`;
    const flags = nextEffect.flags;
    const current = nextEffect.alternate;
    if (flags === Placement) {
      commitPlacement(nextEffect);
    } else if (flags === Update) {
      commitWork(current, nextEffect);
    } else if (flags === Deletion) {
      commitDeletion(nextEffect);
    }
    nextEffect = nextEffect.nextEffect;
  }

  effectList += "null";

  console.log(effectList);

  root.current = finishedWork;
}

// 开始自上而下构建新的fiber树
function workLoopSync() {
  while (workInProgress) {
    performUnitOfWork(workInProgress);
  }
}

// 执行单个工作单元
function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;
  // beginWork返回下一个工作单元
  const next = beginWork(current, unitOfWork);
  // 在beginWork后，需要把新属性同步到老属性上
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next) {
    workInProgress = next;
  } else {
    // 如果当前fiber没有子fiber，说明当前fiber可以完成了
    completeUnitOfWork(unitOfWork);
  }
}

function completeUnitOfWork(unitOfWork) {
  let completedWork = unitOfWork;
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;
    // 完成此fiber对应的真实DOM节点创建和属性赋值的功能
    completeWork(current, completedWork);
    // 收集当前fiber的副作用到父fiber上
    collectEffectList(returnFiber, completedWork);
    // 当前fiber完成后，查找下一个要构建的fiber
    const siblingFiber = completedWork.sibling;
    if (siblingFiber) {
      workInProgress = siblingFiber;
      return;
    }
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (workInProgress);
}

// 副作用链表(Effect List)
// 为了避免遍历fiber树寻找有副作用的fiber节点，所以有了effectList
// 在fiber树构建过程中，每当一个fiber节点的flags字段不为 NoFlags 时，代表需要执行副作用，就把该fiber节点添加到
// effectList中
// effectList是一个单向链表，firstEffect代表链表中的第一个fiber节点，lastEffect代表链表中的最后一个fiber节点
// fiber树的构建是深度优先的，也就是先向下构建子级fiber节点，子级节点构建完成后，再向上构建父级Fiber节点，所以effectList
// 中总是子级Fiber节点在前面
// fiber节点构建完成的操作执行在 completeUnitOfWork 方法，在这个方法里，不仅会对节点完成构建，
// 也会将有flags的fiber节点添加到effectlist中
function collectEffectList(returnFiber, completedWork) {
  if (!returnFiber) return;
  // 如果父节点没有effectList，那就让父节点的firstEffect链表头指向当前节点
  if (!returnFiber.firstEffect) {
    returnFiber.firstEffect = completedWork.firstEffect;
  }
  if (completedWork.lastEffect) {
    // 并且父节点也有链表尾时
    if (returnFiber.lastEffect) {
      // 将当前节点的effectList挂载到父节点的链表尾部
      returnFiber.lastEffect.nextEffect = completedWork.firstEffect;
    }

    returnFiber.lastEffect = completedWork.lastEffect;
  }
  const flags = completedWork.flags;
  // 如果此完成的fiber有副作用，那么就需要添加到effectList里
  if (flags) {
    // 如果父fiber有lastEffect的话，说明父fiber已经有effect链表
    if (returnFiber.lastEffect) {
      returnFiber.lastEffect.nextEffect = completedWork;
    } else {
      returnFiber.firstEffect = completedWork;
    }
    returnFiber.lastEffect = completedWork;
  }
}

function markUpdateLaneFromFiberToRoot(sourceFiber) {
  let node = sourceFiber;
  let parent = node.return;
  while (parent) {
    node = parent;
    parent = parent.return;
  }
  return node.stateNode;
}
