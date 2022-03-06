// nativeEvent 事件真正触发的时候，传递过来的原生浏览器事件对象
export function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent){
    console.log('domEventName', domEventName)
    console.log('eventSystemFlags', eventSystemFlags)
    console.log('targetContainer', targetContainer)
    console.log('nativeEvent', nativeEvent)
}