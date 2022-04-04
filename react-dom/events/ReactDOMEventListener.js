import { getClosestInstanceFromNode, getFiberCurrentPropsFromNode } from '../client/ReactDOMComponentTree'
import { dispatchEventForPluginEventSystem } from './DOMPluginEventSystem'


// nativeEvent 事件真正触发的时候，传递过来的原生浏览器事件对象
export function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent){
    // 获取原生的事件源
    const target = nativeEvent.target || nativeEvent.srcElement || window
    
    // 获取fiber实例
    const targetInst = getClosestInstanceFromNode(target)
    
    dispatchEventForPluginEventSystem(
        domEventName,
        eventSystemFlags,
        nativeEvent,
        targetInst,
        targetContainer
    )
}