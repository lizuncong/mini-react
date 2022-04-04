import { registerSimpleEvents, topLevelEventsToReactNames } from '../DOMEventProperties'
import { SyntheticMouseEvent, SyntheticEvent } from '../SyntheticEvent'
import { accumulateSinglePhaseListeners } from '../DOMPluginEventSystem'
import { IS_CAPTURE_PHASE } from '../EventSystemFlags'

function extractEvents(dispatchQueue, domEventName, targetInst, nativeEvent, nativeEventTarget, eventSystemFlags, targetContainer){
    const reactName = topLevelEventsToReactNames.get(domEventName)
    let SyntheticEventCtor;
    let reactEventType = domEventName
    // 不同的事件，合成事件对象是不一样的，对应不同合成事件构造函数
    switch(domEventName){
        case 'click':
            SyntheticEventCtor = SyntheticMouseEvent;
            break
        default:
            break;
    }
    const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0

    const listeners = accumulateSinglePhaseListeners(
        targetInst,
        reactName,
        nativeEvent.type,
        inCapturePhase
    )
    if(listeners.length){
        const event = new SyntheticEventCtor(
            reactName, 
            reactEventType, 
            targetInst, 
            nativeEvent,
            nativeEventTarget
        )
        dispatchQueue.push({
            event,
            listeners
        })
    }
}


export { registerSimpleEvents as registerEvents, extractEvents }