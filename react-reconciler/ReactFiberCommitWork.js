import { HostComponent } from "../react-dom/ReactWorkTags";
import {
  appendChild,
  removeChild,
  insertBefore,
} from "../react-dom/ReactDOMHostConfig";
import { HostRoot } from "../react-dom/ReactWorkTags";
import { updateProperties } from "../react-dom/ReactDOMComponent";
import { Placement } from "../react-dom";
function getParentStateNode(fiber) {
  const parent = fiber.return;
  do {
    if (parent.tag === HostComponent) {
      return parent.stateNode;
    } else if (parent.tag === HostRoot) {
      return parent.stateNode.containerInfo;
    } else {
      parent = parent.return;
    }
  } while (parent);
}
export function commitPlacement(nextEffect) {
  const stateNode = nextEffect.stateNode;
  const parentStateNode = getParentStateNode(nextEffect);
  let before = getHostSibling(nextEffect);
  if (before) {
    insertBefore(parentStateNode, stateNode, before);
  } else {
    appendChild(parentStateNode, stateNode);
  }
}

function getHostSibling(fiber) {
  let node = fiber.sibling;
  while (node) {
    // 找他的弟弟们，找到最近一个，不是插入的节点，返回
    if (!(node.flags & Placement)) {
      return node.stateNode;
    }
    node = node.sibling;
  }
  return null;
}
// DOM更新
export function commitWork(current, finishedWork) {
  const updatePayload = finishedWork.updateQueue;
  finishedWork.updateQueue = null;
  if (updatePayload) {
    updateProperties(finishedWork.stateNode, updatePayload);
  }
}

export function commitDeletion(fiber) {
  if (!fiber) return;
  const parentStateNode = getParentStateNode(fiber);
  removeChild(parentStateNode, fiber.stateNode);
}
