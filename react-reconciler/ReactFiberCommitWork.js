import { HostComponent } from "../react-dom/ReactWorkTags";
import { appendChild } from "../react-dom/ReactDOMHostConfig";
import { HostRoot } from "../react-dom/ReactWorkTags";
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
