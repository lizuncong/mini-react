import { getFiberCurrentPropsFromNode } from '../client/ReactDOMComponentTree'
export default function getListener(inst, registrationName){
    // return inst.props[registrationName] // 直接返回行不行？不行，props上的事件，比如onclick已经被置为noop空函数
    const stateNode = inst.stateNode
    const props = getFiberCurrentPropsFromNode(stateNode)
    const listener = props[registrationName]
    return listener
}