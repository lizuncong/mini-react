import { registerTwoPhaseEvent } from './EventRegistry'

// i是原生事件 i + 1是对应的React事件
const discreteEventPairsForSimpleEventPlugin = [
    'click', 'click',
]


export const topLevelEventsToReactNames = new Map()

export function registerSimpleEvents(){
    for(let i = 0; i < discreteEventPairsForSimpleEventPlugin.length; i+=2){
        const topEvent = discreteEventPairsForSimpleEventPlugin[i]
        const event = discreteEventPairsForSimpleEventPlugin[i+1]; // react事件
        const capitalizedEvent = event[0].toUpperCase() + event.slice(1)
        const reactName = 'on' + capitalizedEvent
        topLevelEventsToReactNames.set(topEvent, reactName)
        registerTwoPhaseEvent(reactName, [topEvent]); // 注册冒泡和捕获两个阶段的事件
    }
}