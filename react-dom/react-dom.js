import { createFiberRoot } from "./ReactFiberRoot";
import { updateContainer } from "./ReactFiberReconciler";

export default function render(element, container) {
  let fiberRoot = container._reactRootContainer;
  if (!fiberRoot) {
    fiberRoot = container._reactRootContainer = createFiberRoot(container);
  }
  updateContainer(element, fiberRoot); // 更新根容器
}


// TODO: 需要删除