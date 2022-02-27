import { createFiberRoot } from './ReactFiberRoot'
import { updateContainer } from './ReactFiberReconciler'

export default function render(element, container){
    let fiberRoot = createFiberRoot(container);
    updateContainer(element, fiberRoot); // 更新根容器
}