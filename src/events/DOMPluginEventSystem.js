
import { allNativeEvents } from './EventRegistry'
import * as SimpleEventPlugin from './SimpleEventPlugin'
import { getEventListenerSet } from './ReactDOMComponentTree'
import { IS_CAPTURE_PHASE } from './EventSystemFlags'
import { addEventBubbleListener, addEventCaptureListener } from './EventListener'
import { dispatchEvent } from './ReactDOMEventListener'
SimpleEventPlugin.registerEvents()

export const nonDelegatedEvents = new Set(['scroll']) // 这些事件只有捕获，没有冒泡阶段
export function listenToAllSupportedEvents(root){
    allNativeEvents.forEach(domEventName => {
        if(!nonDelegatedEvents.has(domEventName)){
            listenToNativeEvent(domEventName, false, root)
        }
        listenToNativeEvent(domEventName, true, root)
    })
}


function listenToNativeEvent(domEventName, isCaptruePhaseListener, rootContainerElement, eventSystemFlags){
    // 同一个容器上的同一个阶段的同一个事件只绑定一次
    let listenerSet = getEventListenerSet(rootContainerElement)
    const listenerSetKey = getListenerSetKey(domEventName, isCaptruePhaseListener)
    if(!listenerSet.has(listenerSetKey)){
        if(isCaptruePhaseListener){
            eventSystemFlags |= IS_CAPTURE_PHASE
        }
        addTrappedEventListener(
            rootContainerElement,
            domEventName,
            eventSystemFlags,
            isCaptruePhaseListener
        )
        listenerSet.add(listenerSetKey)
    }
}

function addTrappedEventListener(rootContainerElement, domEventName, eventSystemFlags, isCaptruePhaseListener){
    let listener = dispatchEvent.bind(null, domEventName, eventSystemFlags, rootContainerElement)
    if(isCaptruePhaseListener){
        addEventCaptureListener(rootContainerElement, domEventName, listener)
    } else {
        addEventBubbleListener(rootContainerElement, domEventName, listener)
    }
}

function getListenerSetKey(domEventName, isCaptruePhaseListener){
    return `${domEventName}__${isCaptruePhaseListener ? 'capture' : 'bubble' }`
}

