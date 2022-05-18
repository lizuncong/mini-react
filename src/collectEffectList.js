function collectEffectList(returnFiber, completedWork) {
  const flags = completedWork.flags;
  if (flags) {
    if (returnFiber.lastEffect) {
      returnFiber.lastEffect.nextEffect = completedWork;
    } else {
      returnFiber.firstEffect = completedWork;
    }
    returnFiber.lastEffect = completedWork;
  }
}

const Placement = 2;
const rootFIber = { key: "rootFiber" };
const fiberA = { key: "A", flags: Placement };
const fiberB = { key: "B", flags: Placement };
const fiberC = { key: "C", flags: Placement };

// rootFiber -> A -> BC

collectEffectList(fiberA, fiberB);
collectEffectList(fiberA, fiberC);
collectEffectList(rootFIber, fiberA);
