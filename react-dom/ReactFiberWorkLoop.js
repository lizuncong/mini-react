import { createWorkInProgress } from "./ReactFiber";
import { beginWork } from "./ReactFiberBeginWork";
import {
  Placement,
  Update,
  Deletion,
  PlacementAndUpdate,
} from "./ReactFiberFlags";
import { completeWork } from "./ReactFiberCompleteWork";
import {
  commitPlacement,
  commitWork,
  commitDeletion,
} from "../react-reconciler/ReactFiberCommitWork";
let workInProgressRoot = null; // 当前正在更新的根
let workInProgress = null; // 当前正在更新的fiber节点


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
    } else if (flags === PlacementAndUpdate) {
      commitPlacement(nextEffect);
      nextEffect.flags = Update;
      commitWork(current, nextEffect);
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
