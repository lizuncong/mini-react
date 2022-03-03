import { allNativeEvents } from './EventRegistry'
import * as SimpleEventPlugin from './SimpleEventPlugin'

SimpleEventPlugin.registerEvents()

export function listenToAllSupportedEvents(root){
    allNativeEvents.forEach(domEventName => {
        console.log('domEventName...', domEventName)
    })
}