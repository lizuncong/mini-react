export function addEventCaptureListener(target, eventType, listener){
    target.addEventListener(eventType, listener, true)
}

export function addEventBubbleListener(target, eventType, listener){
    target.addEventListener(eventType, listener, false)
}