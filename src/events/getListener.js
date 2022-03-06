import { getFiberCurrentPropsFromNode } from './ReactDOMComponentTree'
export default function getListener(fiberInst, registrationName){
    // return fiberInst.props[registrationName] // 直接返回行不行？不行，props上的事件，比如onclick已经被置为noop空函数
    const stateNode = fiberInst.stateNode
    const props = getFiberCurrentPropsFromNode(stateNode)
    const listener = props[registrationName]
    return listener
}