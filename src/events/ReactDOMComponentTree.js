const randomKey = Math.random().toString(36).slice(2)

const internalEventHandlersKey = '__reactEvents$' + randomKey
// node容器节点，原生node元素
export function getEventListenerSet(node){
    let elementListenerSet = node[internalEventHandlersKey]
    if(!elementListenerSet){
        elementListenerSet = node[internalEventHandlersKey] = new Set()
    }

    return elementListenerSet
}