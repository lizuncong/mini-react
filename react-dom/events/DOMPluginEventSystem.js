
import { allNativeEvents } from './EventRegistry'
import * as SimpleEventPlugin from './plugins/SimpleEventPlugin'
import { getEventListenerSet } from '../client/ReactDOMComponentTree'
import { IS_CAPTURE_PHASE } from './EventSystemFlags'
import { addEventBubbleListener, addEventCaptureListener } from './EventListener'
import { dispatchEvent } from './ReactDOMEventListener'
import getListener from './getListener'
const HostComponent = 5
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


export function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer){
    const nativeEventTarget = nativeEvent.target;
    const dispatchQueue = []
    // 由插件提取事件处理函数，填充 dispatchQueue 数组
    SimpleEventPlugin.extractEvents(
        dispatchQueue,
        domEventName,
        targetInst,
        nativeEvent,
        nativeEventTarget,
        eventSystemFlags,
        targetContainer
    )

    processDispatchQueue(dispatchQueue, eventSystemFlags)
}


function processDispatchQueue(dispatchQueue, eventSystemFlags){
    const isCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0
    for(let i = 0; i < dispatchQueue.length; i++){
        const { event, listeners } = dispatchQueue[i]
        processDispatchQueueItemsInOrder(event, listeners, isCapturePhase)
    }
}

function processDispatchQueueItemsInOrder(event, listeners, isCapturePhase){
    console.log('listenrs...', listeners)
    if(isCapturePhase){
        for(let i = listeners.length - 1; i >= 0; i--){
            const [ currentTarget, listener ] = listeners[i]
            if(event.isPropagationStopped()){
                return
            }
            execDispatch(event, listener, currentTarget)
        }
    } else {
        for(let i = 0; i < listeners.length; i++){
            const [ currentTarget, listener ] = listeners[i]
            if(event.isPropagationStopped()){
                return
            }
            execDispatch(event, listener, currentTarget)
        }
    }
}
function execDispatch(event, listener, currentTarget){
    event.currentTarget = currentTarget
    listener(event)
    event.currentTarget = null
}

export function accumulateSinglePhaseListeners(targetFiber, reactName, nativeType, inCapturePhase){
    const captureName = reactName + 'Capture'
    const reactEventName = inCapturePhase ? captureName : reactName
    const listeners = []
    let instance = targetFiber
    let lastHostComponent = null
    while(instance){
        const { stateNode, tag } = instance
        if(tag === HostComponent && stateNode !== null){
            lastHostComponent = stateNode
            const listener = getListener(instance, reactEventName)
            if(listener){
                listeners.push(createDispatchListener(instance, listener, lastHostComponent))
            }
        }
        instance = instance.return
    }
    return listeners
}


function createDispatchListener(instance, listener, currentTarget){
    return [instance, listener, currentTarget]
}