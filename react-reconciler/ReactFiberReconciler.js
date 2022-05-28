import { createFiberRoot } from './ReactFiberRoot'
export function createContainer(containerInfo, tag, hydrate, hydrationCallbacks) {
    return createFiberRoot(containerInfo, tag, hydrate);
}