export function commitPlacement(nextEffect) {
  const stateNode = nextEffect.stateNode;
  const parentStateNode = nextEffect.return.stateNode.containerInfo;
  parentStateNode.appendChild(stateNode);
}
