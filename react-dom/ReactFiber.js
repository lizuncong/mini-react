import { HostRoot } from "./ReactWorkTags";

export function createHostRootFiber(){
    return createFiber(HostRoot)
}

/**
 * 创建fiber节点
 * tag fiber的标签
 * pendingProps 等待生效的属性对象
*/
function createFiber(tag, pendingProps, key){

}