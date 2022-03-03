const discreteEventPairsForSimpleEventPlugin = [
    'click', 'click',
]


export const topLevelEventsToReactNames = new Map()

export function registerSimpleEvents(){
    for(let i = 0; i < discreteEventPairsForSimpleEventPlugin.length; i++){
        const topEvent = discreteEventPairsForSimpleEventPlugin[i]
        const event = discreteEventPairsForSimpleEventPlugin[i+1]; // react事件
        const capitalizedEvent = event[0].toUpperCase() + event.slice(1)
        const reactName = 'on' + capitalizedEvent
        topLevelEventsToReactNames.set(topEvent, reactName)
    }
}