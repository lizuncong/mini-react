import { HostComponent } from "../react-dom/ReactWorkTags";
import { appendChild, removeChild } from "../react-dom/ReactDOMHostConfig";
import { HostRoot } from "../react-dom/ReactWorkTags";
import { updateProperties } from "../react-dom/ReactDOMComponent";
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
  appendChild(parentStateNode, stateNode);
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
